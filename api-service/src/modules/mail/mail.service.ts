import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.mailService.sendMail({
        to,
        subject,
        text,
      });
    } catch (error) {
      console.log('Error al enviar correo', error);
    }
  }
}
