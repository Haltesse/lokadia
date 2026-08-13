/**
 * webpush — envoi de notifications Web Push signées VAPID (RFC 8292),
 * sans dépendance externe : tout passe par la WebCrypto de Deno.
 *
 * Choix d'architecture : on envoie une notification SANS charge utile.
 * Le service worker est simplement réveillé, puis il va chercher le
 * message via `push-pending`. Deux bénéfices :
 *   · aucun contenu sensible ne transite par le service de push du
 *     navigateur (Google, Mozilla, Apple) ;
 *   · pas de chiffrement aes128gcm à implémenter, donc moins de surface
 *     de bug sur un chemin critique.
 */

const encoder = new TextEncoder();

function b64url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Importe la clé privée VAPID (scalaire base64url) en clé de signature ECDSA. */
async function importVapidKey(privateKeyB64: string, publicKeyB64: string): Promise<CryptoKey> {
  const d = privateKeyB64;
  const pub = b64urlToBytes(publicKeyB64);
  // Le point public non compressé fait 65 octets : 0x04 || X(32) || Y(32)
  const x = b64url(pub.subarray(1, 33));
  const y = b64url(pub.subarray(33, 65));

  return crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d, x, y, ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
}

/** Construit l'en-tête Authorization VAPID pour une origine de push donnée. */
async function vapidHeader(audience: string): Promise<string> {
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
  const subject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contact@lokadia.fr';
  if (!privateKey || !publicKey) throw new Error('Clés VAPID absentes côté serveur');

  const header = b64url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(
    encoder.encode(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
        sub: subject,
      }),
    ),
  );

  const key = await importVapidKey(privateKey, publicKey);
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(`${header}.${payload}`),
  );

  return `vapid t=${header}.${payload}.${b64url(signature)}, k=${publicKey}`;
}

export interface PushTarget {
  endpoint: string;
}

export interface PushOutcome {
  endpoint: string;
  ok: boolean;
  status: number;
  /** true quand l'abonnement est mort et doit être supprimé (404/410) */
  gone: boolean;
}

/**
 * Réveille un abonnement. `urgency` reste sur 'high' : il s'agit de
 * messages de sécurité, ils ne doivent pas être retardés par le navigateur.
 */
export async function sendPush(target: PushTarget, ttlSeconds = 3600): Promise<PushOutcome> {
  const url = new URL(target.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  try {
    const res = await fetch(target.endpoint, {
      method: 'POST',
      headers: {
        Authorization: await vapidHeader(audience),
        TTL: String(ttlSeconds),
        Urgency: 'high',
        // Sans charge utile : le SW ira chercher le message
        'Content-Length': '0',
      },
      signal: AbortSignal.timeout(10000),
    });

    return {
      endpoint: target.endpoint,
      ok: res.ok,
      status: res.status,
      gone: res.status === 404 || res.status === 410,
    };
  } catch (err) {
    console.error('[webpush] échec envoi', err);
    return { endpoint: target.endpoint, ok: false, status: 0, gone: false };
  }
}

/** Clé publique VAPID, destinée au client (publique par conception). */
export function vapidPublicKey(): string {
  return Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
}
