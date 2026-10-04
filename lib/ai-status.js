export function aiFailure(data, status = 503) {
  const raw = String(data?.error?.message || data?.error || data?.message || '');
  const type = data?.error?.type || '';
  if (type === 'customer_verification_required' || /credit card on file/i.test(raw)) {
    return { code: 'ai_billing_required', message: 'L’IA est en attente d’activation par Mise. Les menus locaux restent disponibles.', ownerMessage: 'Vercel demande une carte bancaire pour activer AI Gateway. Votre accès propriétaire reste gratuit.' };
  }
  if (status === 402) return { code: 'ai_credit_required', message: 'Les crédits IA sont épuisés. Les menus locaux restent disponibles.' };
  if (status === 429) return { code: 'ai_rate_limit', message: 'Trop de demandes IA. Réessayez dans quelques instants.' };
  return { code: 'ai_unavailable', message: 'L’IA est indisponible pour le moment. Les menus locaux restent disponibles.' };
}
