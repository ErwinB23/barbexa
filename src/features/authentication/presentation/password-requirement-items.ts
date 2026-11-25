import { passwordChecks } from '../domain/password-policy';

const labels = {
  length: 'Al menos 8 caracteres',
  uppercase: 'Una mayúscula (A–Z)',
  lowercase: 'Una minúscula (a–z)',
  number: 'Un número (0–9)',
  symbol: 'Un símbolo admitido, como !, # o @',
} satisfies Record<keyof ReturnType<typeof passwordChecks>, string>;

export function passwordRequirementItems(password: string) {
  const checks = passwordChecks(password);
  return (Object.keys(labels) as (keyof typeof labels)[]).map((key) => ({
    key,
    label: labels[key],
    met: checks[key],
  }));
}
