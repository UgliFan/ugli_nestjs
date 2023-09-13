import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { getMessageFromNormalError } from '@app/transformers/error.transformer';
import { APP } from '@app/configs/app.config';
import Argvs from '@app/configs/secret';
import logger from '@app/utils/logger';

const log = logger.scope('EmailService');

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private clientIsValid: boolean;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: Argvs.qqMailAccount,
        pass: Argvs.qqMailToken,
      },
    });
    this.verifyClient();
  }

  private verifyClient(): void {
    return this.transporter.verify((error) => {
      if (error) {
        this.clientIsValid = false;
        setTimeout(this.verifyClient.bind(this), 1000 * 60 * 30);
        log.error(`client init failed! retry when after 30 mins,`, getMessageFromNormalError(error));
      } else {
        this.clientIsValid = true;
        log.info('client init succeed.');
      }
    });
  }

  public sendMail(mailOptions: EmailOptions) {
    if (!this.clientIsValid) {
      log.warn('send failed! (init failed)');
      return false;
    }

    this.transporter.sendMail(
      {
        ...mailOptions,
        from: `"${APP.FE_NAME}" <${Argvs.qqMailAccount}>`,
      },
      (error, info) => {
        if (error) {
          log.error(`send failed!`, getMessageFromNormalError(error));
        } else {
          log.info('send succeed.', info.messageId, info.response);
        }
      },
    );
  }

  public sendMailAs(prefix: string, mailOptions: EmailOptions) {
    return this.sendMail({
      ...mailOptions,
      subject: `[${prefix}] ${mailOptions.subject}`,
    });
  }
}
