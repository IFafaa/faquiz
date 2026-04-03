export const QR_CODE_PORT = Symbol('QR_CODE_PORT');

export interface IQrCodePort {
  toPngBase64(text: string): Promise<string>;
}
