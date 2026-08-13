/**
 * push-handler.js — reçu par le service worker Workbox (importScripts).
 *
 * Les notifications de crise arrivent SANS charge utile chiffrée : le push
 * ne sert qu'à réveiller le service worker, qui va ensuite chercher le
 * message qui l'attend. Ce choix évite le chiffrement aes128gcm côté
 * serveur, et surtout il garantit qu'aucun contenu sensible ne transite
 * par le service de push du navigateur (Google, Mozilla, Apple).
 *
 * Le worker s'identifie par son propre endpoint d'abonnement, jamais par
 * un identifiant de personne placé dans l'URL.
 */

/* global self, clients */

const PENDING_ENDPOINT = '__PENDING_URL__';

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let payload = null;

      // Certains navigateurs peuvent délivrer un corps ; on l'accepte s'il
      // est présent, sinon on va chercher le message.
      try {
        if (event.data) payload = event.data.json();
      } catch {
        payload = null;
      }

      if (!payload) {
        try {
          const sub = await self.registration.pushManager.getSubscription();
          if (sub) {
            const res = await fetch(
              `${PENDING_ENDPOINT}?endpoint=${encodeURIComponent(sub.endpoint)}`,
              { headers: { Accept: 'application/json' } },
            );
            if (res.ok) payload = await res.json();
          }
        } catch {
          payload = null;
        }
      }

      const title = payload?.title || 'Message de votre organisation';
      const body = payload?.body || 'Ouvrez Lokadia pour consulter le message.';
      const url = payload?.url || '/';

      await self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        lang: 'fr',
        tag: payload?.tag || 'lokadia-securite',
        renotify: true,
        requireInteraction: payload?.urgent === true,
        data: { url },
      });
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Réutilise un onglet Lokadia déjà ouvert plutôt que d'en empiler un
      for (const client of windows) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          await client.focus();
          if ('navigate' in client) await client.navigate(target);
          return;
        }
      }
      if (clients.openWindow) await clients.openWindow(target);
    })(),
  );
});
