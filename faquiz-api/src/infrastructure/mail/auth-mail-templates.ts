export function verificationEmailLink(frontendBaseUrl: string, token: string): string {
  const base = frontendBaseUrl.replace(/\/$/, '');
  return `${base}/verificar-email?token=${encodeURIComponent(token)}`;
}

export function passwordResetLink(frontendBaseUrl: string, token: string): string {
  const base = frontendBaseUrl.replace(/\/$/, '');
  return `${base}/redefinir-senha?token=${encodeURIComponent(token)}`;
}
