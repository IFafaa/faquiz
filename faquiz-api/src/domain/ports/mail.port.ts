export const MAIL_PORT = Symbol('MAIL_PORT');

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface IMailPort {
  send(input: SendMailInput): Promise<void>;
}
