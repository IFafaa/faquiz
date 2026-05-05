/** Critérios alinhados ao backend (RegisterDto — @Matches). */

export type PasswordChecks = {
  minLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasDigit: boolean
  hasSpecial: boolean
}

/** Qualquer caractere que não seja letra ou número (símbolo ou espaço não é “especial” aqui: exigimos símbolo). */
export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8 && password.length <= 128,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }
}

export function isStrongPassword(password: string): boolean {
  const c = getPasswordChecks(password)
  return (
    c.minLength && c.hasUpper && c.hasLower && c.hasDigit && c.hasSpecial
  )
}

/** 0–5 para a barra (todos os critérios). */
export function passwordStrengthScore(password: string): number {
  const c = getPasswordChecks(password)
  return [
    c.minLength,
    c.hasUpper,
    c.hasLower,
    c.hasDigit,
    c.hasSpecial,
  ].filter(Boolean).length
}
