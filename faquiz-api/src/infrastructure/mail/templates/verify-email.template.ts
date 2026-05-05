import { escapeHtml } from '../escape-html.js';
import type { MailBody } from './mail-template.types.js';

const SUBJECT = 'Confirme seu e-mail — FAQuiz';

export function verifyEmailWelcome(params: {
  recipientName: string;
  confirmLink: string;
}): MailBody {
  const { recipientName, confirmLink } = params;
  const name = recipientName.trim();
  return {
    subject: SUBJECT,
    text: [
      `Olá, ${name}.`,
      '',
      'Bem-vindo ao FAQuiz. Confirme seu e-mail abrindo o link:',
      confirmLink,
      '',
      'O link expira em 24 horas.',
    ].join('\n'),
    html: [
      `<p>Olá, ${escapeHtml(name)}.</p>`,
      `<p>Bem-vindo ao FAQuiz. Confirme seu e-mail usando o botão abaixo ou copiando o link.</p>`,
      `<p><a href="${confirmLink}">Confirmar e-mail</a></p>`,
      `<p>O link expira em 24 horas.</p>`,
    ].join(''),
  };
}

export function verifyEmailResend(params: {
  recipientName: string;
  confirmLink: string;
}): MailBody {
  const { recipientName, confirmLink } = params;
  const name = recipientName.trim();
  return {
    subject: SUBJECT,
    text: [
      `Olá, ${name}.`,
      '',
      'Confirme seu e-mail abrindo o link:',
      confirmLink,
      '',
      'O link expira em 24 horas.',
    ].join('\n'),
    html: [
      `<p>Olá, ${escapeHtml(name)}.</p>`,
      `<p><a href="${confirmLink}">Confirmar e-mail</a></p>`,
      `<p>O link expira em 24 horas.</p>`,
    ].join(''),
  };
}
