-- ════════════════════════════════════════════════════════════════════════
--  Envoi effectif des briefings par e-mail
-- ════════════════════════════════════════════════════════════════════════
--
--  `sent_at` était posé à la création de l'accusé — c'est-à-dire au moment
--  où le LIEN était généré, pas au moment où le voyageur recevait quoi que
--  ce soit. Le nom prêtait à confusion et, surtout, rien ne permettait de
--  savoir si un message était réellement parti.
--
--  `emailed_at` répond à la seule question qui compte devant un auditeur :
--  quand cette personne a-t-elle été destinataire du briefing ? Il n'est
--  posé que par la fonction d'envoi, après acceptation par le fournisseur
--  de messagerie — jamais à l'avance, jamais par le client.

alter table public.briefing_receipts
  add column if not exists emailed_at timestamptz;

comment on column public.briefing_receipts.sent_at is
  'Génération du lien d''accusé (création de la ligne).';
comment on column public.briefing_receipts.emailed_at is
  'Remise effective du message au fournisseur d''envoi. Null = jamais envoyé.';

create index if not exists receipts_emailed_idx
  on public.briefing_receipts (org_id, emailed_at);
