import { Injectable } from '@nestjs/common';
import QRCode from 'qrcode';
import type { IQrCodePort } from '../../domain/ports/qr-code.port.js';

@Injectable()
export class QrCodeService implements IQrCodePort {
  async toPngBase64(text: string): Promise<string> {
    const buffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 320,
      margin: 2,
    });
    return buffer.toString('base64');
  }
}
