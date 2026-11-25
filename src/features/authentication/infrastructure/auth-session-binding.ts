// Used only to compare credentials. Auth and the backend verify the JWT.
export function readAuthSessionBinding(token: unknown) {
  if (typeof token !== 'string') return null;
  try {
    const claims: { sub?: unknown; session_id?: unknown } = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (
      typeof claims.sub !== 'string' ||
      typeof claims.session_id !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(claims.session_id)
    )
      return null;
    return {
      userId: claims.sub,
      sessionId: claims.session_id,
    };
  } catch {
    return null;
  }
}
