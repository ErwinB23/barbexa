const authSymbols = '!@#$%^&*()_+-=[]{};\'\\:"|<>?,./`~';

export function passwordChecks(password: string) {
  // Count Unicode code points: surrogate pairs count once, combining marks separately.
  // GoTrue's configured minimum counts UTF-8 bytes instead.
  return {
    length: [...password].length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: [...password].some((character) => authSymbols.includes(character)),
  };
}

export function newPasswordProblem(password: string, confirmation: string) {
  if (!Object.values(passwordChecks(password)).every(Boolean))
    return 'weak-password';
  return password === confirmation ? null : 'password-mismatch';
}
