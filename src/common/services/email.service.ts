import fs from 'node:fs';
import path from 'node:path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { logger } from '../../helpers/logger';

export type EmailOptions = {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
  tags?: Array<{
    name: string;
    value: string;
  }>;
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: Number.parseInt(process.env.EMAIL_SMTP_PORT || '25', 10),
      secure: process.env.EMAIL_SMTP_PORT === '465',
      auth: {
        user: process.env.EMAIL_SMTP_USERNAME,
        pass: process.env.EMAIL_SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter
      .verify()
      .then(() => {
        logger.info('Mail service SMTP connection verified');
      })
      .catch((error) => {
        logger.error({ error }, 'Mail service SMTP connection failed');
      });
  }
  return transporter;
};

const compileTemplate = async (
  templateName: string,
  context: Record<string, unknown>,
): Promise<string> => {
  try {
    const candidates = [
      path.resolve(process.cwd(), 'dist/templates'),
      path.resolve(process.cwd(), 'src/templates'),
    ].filter(Boolean);

    for (const dir of candidates) {
      const fp = path.join(dir, `${templateName}.hbs`);

      if (fs.existsSync(fp)) {
        const source = await fs.promises.readFile(fp, 'utf-8');
        const template = handlebars.compile(source);

        return template(context);
      }
    }

    throw new Error('Template not found in any known directory');
  } catch (error) {
    logger.error(
      { error, data: { templateName, context } },
      'Failed to compile email template',
    );

    throw new Error('Failed to compile email template');
  }
};

export const sendEmailSmtp = async ({
  to,
  subject,
  template,
  context,
  cc,
  bcc,
  attachments,
  tags,
}: EmailOptions): Promise<{ success: boolean }> => {
  try {
    const html = await compileTemplate(template, context);

    const senderName = process.env.EMAIL_SMTP_SENDER_NAME;
    const senderEmail = process.env.EMAIL_SMTP_FROM_ADDRESS;

    if (!(senderName && senderEmail)) {
      throw new Error('EMAIL_FROM_NAME/EMAIL_FROM_ADDRESS not set');
    }

    const headers = tags?.length
      ? tags.reduce<Record<string, string>>((acc, tag) => {
          acc[`X-Tag-${tag.name}`] = String(tag.value);
          return acc;
        }, {})
      : undefined;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `${senderName} <${senderEmail}>`,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
      headers,
    };

    const result = await getTransporter().sendMail(mailOptions);

    logger.info(
      {
        event: 'EMAIL_SENT',
        data: { to, subject, template, messageId: result.messageId },
      },
      'Email sent via SMTP',
    );

    return { success: true };
  } catch (error) {
    logger.error(
      { error, data: { to, subject, template } },
      'Failed to send email via SMTP',
    );
    throw new Error('Failed to send email');
  }
};
