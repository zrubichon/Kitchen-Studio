// Server-only identity check. Neither localStorage nor user_metadata grants access.
export const OWNER_EMAIL = 'zoe.rubichon@gmail.com';
export const OWNER_USER_ID = 'f5c3aa14-dd2d-4544-9702-b9b35e7d791b';
const URL = process.env.SUPABASE_URL || 'https://ojacdskephxupbjbkyep.supabase.co';
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XGO8qr7If3JiSMsWoCWdCA_tUj3fi2f';

export function accessForUser(user) {
  const owner = Boolean(user?.email_confirmed_at && user.id === OWNER_USER_ID && String(user.email || '').trim().toLowerCase() === OWNER_EMAIL);
  // Other accounts stay free until verified billing is implemented.
  return { owner, premium: owner, studentPack: owner, source: owner ? 'owner' : 'free' };
}

export async function authenticatedUser(req) {
  const authorization = req.headers?.authorization || '';
  if (!/^Bearer \S+$/i.test(authorization)) return null;
  const r = await fetch(URL + '/auth/v1/user', {
    headers: { apikey: KEY, Authorization: authorization },
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.id ? user : null;
}

export async function requirePremium(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const user = await authenticatedUser(req);
    if (!user) { res.status(401).json({ error: 'Connectez votre compte Mise.', code: 'auth_required' }); return null; }
    const access = accessForUser(user);
    if (!access.premium) { res.status(403).json({ error: 'Cette fonction nécessite Mise Premium.', code: 'premium_required' }); return null; }
    // The preview selector may reduce owner permissions, never grant permissions.
    const preview = req.headers?.['x-mise-preview'];
    if (access.owner && preview && !['all', 'premium'].includes(preview)) {
      res.status(403).json({ error: 'Cette fonction est verrouillée dans cet aperçu.', code: 'preview_locked' }); return null;
    }
    return user;
  } catch {
    res.status(503).json({ error: 'Vérification du compte indisponible.', code: 'auth_unavailable' }); return null;
  }
}
