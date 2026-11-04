import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('node:fs');
jest.mock('handlebars', () => ({
  compile: jest.fn(() => jest.fn(() => '<html>rendered</html>')),
}));
jest.mock('../../helpers/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

// Must be imported after jest.mock calls so mocks are in place when the
// module is first loaded (the transporter singleton is lazy so mocks apply).
import { sendEmailSmtp } from './email.service';
import type { EmailOptions } from './email.service';

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
const mockedFs = fs as jest.Mocked<typeof fs>;

const mockSendMail = jest.fn();
const mockVerify = jest.fn();

const baseOptions: EmailOptions = {
  to: 'recipient@example.com',
  subject: 'Test Subject',
  template: 'test-template',
  context: { name: 'John' },
};

beforeEach(() => {
  jest.clearAllMocks();

  process.env.EMAIL_SMTP_HOST = 'smtp.test.com';
  process.env.EMAIL_SMTP_PORT = '587';
  process.env.EMAIL_SMTP_USERNAME = 'user@test.com';
  process.env.EMAIL_SMTP_PASSWORD = 'password';
  process.env.EMAIL_SMTP_SENDER_NAME = 'Test Sender';
  process.env.EMAIL_SMTP_FROM_ADDRESS = 'noreply@test.com';

  mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
  mockVerify.mockResolvedValue(true);

  // The transporter singleton is lazy — set up the factory so whichever
  // test triggers getTransporter() first gets our mock.
  mockedNodemailer.createTransport.mockReturnValue({
    sendMail: mockSendMail,
    verify: mockVerify,
  } as unknown as nodemailer.Transporter);

  mockedFs.existsSync.mockReturnValue(true);
  mockedFs.promises = {
    readFile: jest.fn().mockResolvedValue('<html>{{name}}</html>'),
  } as unknown as typeof fs.promises;
});

describe('sendEmailSmtp', () => {
  it('should send an email and return { success: true }', async () => {
    const result = await sendEmailSmtp(baseOptions);
    expect(result).toEqual({ success: true });
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should set from, to, subject and html on the mail options', async () => {
    await sendEmailSmtp(baseOptions);
    const callArg = mockSendMail.mock.calls[0][0] as nodemailer.SendMailOptions;
    expect(callArg.from).toBe('Test Sender <noreply@test.com>');
    expect(callArg.to).toBe('recipient@example.com');
    expect(callArg.subject).toBe('Test Subject');
    expect(callArg.html).toBe('<html>rendered</html>');
  });

  it('should forward array recipients and optional fields', async () => {
    const options: EmailOptions = {
      ...baseOptions,
      to: ['a@test.com', 'b@test.com'],
      cc: ['cc@test.com'],
      bcc: ['bcc@test.com'],
      attachments: [{ filename: 'file.pdf', content: Buffer.from('data') }],
    };
    await sendEmailSmtp(options);
    const callArg = mockSendMail.mock.calls[0][0] as nodemailer.SendMailOptions;
    expect(callArg.to).toEqual(['a@test.com', 'b@test.com']);
    expect(callArg.cc).toEqual(['cc@test.com']);
    expect(callArg.bcc).toEqual(['bcc@test.com']);
    expect(callArg.attachments).toHaveLength(1);
  });

  it('should build X-Tag-* headers from tags array', async () => {
    await sendEmailSmtp({
      ...baseOptions,
      tags: [
        { name: 'campaign', value: 'welcome' },
        { name: 'env', value: 'prod' },
      ],
    });
    const callArg = mockSendMail.mock.calls[0][0] as nodemailer.SendMailOptions;
    expect(callArg.headers).toEqual({
      'X-Tag-campaign': 'welcome',
      'X-Tag-env': 'prod',
    });
  });

  it('should omit headers when tags is an empty array', async () => {
    await sendEmailSmtp({ ...baseOptions, tags: [] });
    const callArg = mockSendMail.mock.calls[0][0] as nodemailer.SendMailOptions;
    expect(callArg.headers).toBeUndefined();
  });

  it('should omit headers when tags is not provided', async () => {
    await sendEmailSmtp(baseOptions);
    const callArg = mockSendMail.mock.calls[0][0] as nodemailer.SendMailOptions;
    expect(callArg.headers).toBeUndefined();
  });

  it('should throw when EMAIL_SMTP_SENDER_NAME is not set', async () => {
    delete process.env.EMAIL_SMTP_SENDER_NAME;
    await expect(sendEmailSmtp(baseOptions)).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('should throw when EMAIL_SMTP_FROM_ADDRESS is not set', async () => {
    delete process.env.EMAIL_SMTP_FROM_ADDRESS;
    await expect(sendEmailSmtp(baseOptions)).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('should throw when sendMail rejects', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection refused'));
    await expect(sendEmailSmtp(baseOptions)).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('should throw when the template is not found in any candidate directory', async () => {
    mockedFs.existsSync.mockReturnValue(false);
    await expect(sendEmailSmtp(baseOptions)).rejects.toThrow(
      'Failed to send email',
    );
  });

  it('should prefer the dist/templates directory over src/templates', async () => {
    mockedFs.existsSync.mockImplementation((fp) =>
      String(fp).includes('dist/templates'),
    );
    await sendEmailSmtp(baseOptions);
    const firstChecked = String(mockedFs.existsSync.mock.calls[0][0]);
    expect(firstChecked).toContain('dist/templates');
  });

  it('should fall back to src/templates when dist/templates does not exist', async () => {
    mockedFs.existsSync.mockImplementation((fp) =>
      String(fp).includes('src/templates'),
    );
    const result = await sendEmailSmtp(baseOptions);
    expect(result).toEqual({ success: true });
    const checkedPaths = mockedFs.existsSync.mock.calls.map((c) =>
      String(c[0]),
    );
    expect(checkedPaths.some((p) => p.includes('dist/templates'))).toBe(true);
    expect(checkedPaths.some((p) => p.includes('src/templates'))).toBe(true);
  });

  it('should throw when readFile rejects', async () => {
    mockedFs.promises = {
      readFile: jest.fn().mockRejectedValue(new Error('ENOENT')),
    } as unknown as typeof fs.promises;
    await expect(sendEmailSmtp(baseOptions)).rejects.toThrow(
      'Failed to send email',
    );
  });
});

describe('template path resolution', () => {
  it('should resolve candidate directories relative to process.cwd()', async () => {
    const cwd = process.cwd();
    await sendEmailSmtp(baseOptions);
    const checkedPaths = mockedFs.existsSync.mock.calls.map((c) =>
      String(c[0]),
    );
    expect(checkedPaths.every((p) => p.startsWith(cwd))).toBe(true);
    expect(checkedPaths[0]).toContain(
      path.join('dist', 'templates', `${baseOptions.template}.hbs`),
    );
  });
});
