import { escapeHtml } from '../escape-html.js';
import type { MailBody } from './mail-template.types.js';

export function passwordReset(params: {
  recipientName: string;
  resetLink: string;
}): MailBody {
  const { recipientName, resetLink } = params;
  const name = recipientName.trim();
  return {
    subject: 'Redefinição de senha — FAQuiz',
    text: [
      `Olá, ${name}.`,
      '',
      'Para definir uma nova senha, abra o link:',
      resetLink,
      '',
      'O link expira em 1 hora. Se você não pediu isso, ignore este e-mail.',
    ].join('\n'),
    html: [
      `<p>Olá, ${escapeHtml(name)}.</p>`,
      `<p><a href="${resetLink}">Redefinir senha</a></p>`,
      `<p>O link expira em 1 hora. Se você não pediu isso, ignore este e-mail.</p>`,
    ].join(''),
  };
}
