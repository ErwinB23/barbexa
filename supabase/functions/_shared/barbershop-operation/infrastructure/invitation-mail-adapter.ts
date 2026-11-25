import type {
  InvitationMailGateway,
  InvitationEnvelope,
} from '../application/admin-invitations.ts';
import { BusinessError } from '../domain/values.ts';
import { teamId } from '../domain/team-input.ts';
interface MailOptions {
  readonly from: string;
  readonly webOrigin: string;
}
function email(value: string) {
  if (
    value.length > 254 ||
    !/^\S+@[^\s<>]+\.[^\s<>]+$/.test(value) ||
    /[\r\n<>]/.test(value)
  )
    throw new BusinessError('INVALID_INPUT');
  return value;
}
function renderer(options: MailOptions, development: boolean) {
  const origin = new URL(options.webOrigin);
  email(options.from);
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== '/' ||
    origin.search ||
    origin.hash ||
    !(
      origin.protocol === 'https:' ||
      (development &&
        origin.protocol === 'http:' &&
        origin.host === 'localhost:8081')
    )
  )
    throw new BusinessError('INVALID_INPUT');
  return (envelope: InvitationEnvelope) => {
    const id = teamId(envelope.invitationId),
      recipient = email(envelope.recipientEmail),
      web = new URL('/staff', origin);
    web.searchParams.set('invitationId', id);
    if (
      !Number.isFinite(Date.parse(envelope.expiresAt)) ||
      !envelope.barbershopName.trim() ||
      envelope.barbershopName.length > 200
    )
      throw new BusinessError('INVALID_INPUT');
    return {
      to: recipient,
      subject: 'Invitación para administrar una barbería',
      text: [
        `Te invitaron a administrar ${envelope.barbershopName}.`,
        'Debes iniciar sesión con tu cuenta y aceptar o rechazar dentro de App Barbería. Este mensaje no concede permisos.',
        `Web: ${web.href}`,
        `Android: appbarberia://staff?invitationId=${id}`,
        `Válida hasta: ${envelope.expiresAt}`,
        'Si no esperabas esta invitación, puedes rechazarla en la aplicación.',
      ].join('\n'),
    };
  };
}
export function createResendInvitationMail(
  options: MailOptions & {
    readonly apiKey: string;
    readonly fetcher?: typeof fetch;
  },
): InvitationMailGateway {
  const render = renderer(options, false);
  if (!options.apiKey || /[\r\n]/.test(options.apiKey))
    throw new BusinessError('INVALID_INPUT');
  return {
    async send(envelope, key) {
      if (!key || key.length > 256 || /[\r\n]/.test(key))
        throw new BusinessError('INVALID_INPUT');
      const value = render(envelope);
      try {
        const response = await (options.fetcher ?? fetch)(
          'https://api.resend.com/emails',
          {
            method: 'POST',
            redirect: 'error',
            headers: {
              Authorization: 'Bearer ' + options.apiKey,
              'Content-Type': 'application/json',
              'Idempotency-Key': key,
            },
            body: JSON.stringify({
              from: options.from,
              to: [value.to],
              subject: value.subject,
              text: value.text,
            }),
            signal: AbortSignal.timeout(8000),
          },
        );
        if (response.ok) {
          const data: unknown = await response.json();
          return data &&
            typeof data === 'object' &&
            'id' in data &&
            typeof data.id === 'string' &&
            data.id.trim().length > 0
            ? 'sent'
            : 'unknown';
        }
        return response.status >= 400 &&
          response.status < 500 &&
          response.status !== 408
          ? 'failed'
          : 'unknown';
      } catch {
        return 'unknown';
      }
    },
  };
}
interface SmtpSocket {
  read(value: Uint8Array): Promise<number | null>;
  write(value: Uint8Array): Promise<number>;
  close(): void;
}
class SmtpRejected extends Error {}
export function createLocalInvitationMail(
  options: MailOptions & {
    readonly development: boolean;
    readonly connector?: () => Promise<SmtpSocket>;
    readonly timeoutMs?: number;
  },
): InvitationMailGateway {
  if (!options.development || !options.from.endsWith('@example.invalid'))
    throw new BusinessError('INVALID_INPUT');
  const render = renderer(options, true),
    connect =
      options.connector ??
      (() =>
        Deno.connect({
          hostname: 'supabase_inbucket_app-barberia-002-local',
          port: 1025,
        }));
  return {
    async send(envelope) {
      const value = render(envelope);
      // LOCAL Mailpit fixtures only: exact reserved domains, no external or
      // partial matches. The production Resend adapter has its own path above.
      if (!/^[^@\s<>]+@example\.(invalid|test)$/i.test(value.to))
        throw new BusinessError('INVALID_INPUT');
      let socket: SmtpSocket | null = null,
        finished = false,
        transmitted = false,
        acknowledged = false,
        timer: ReturnType<typeof setTimeout> | undefined;
      let pending = '';
      const write = async (value: string) => {
        const bytes = new TextEncoder().encode(value);
        let offset = 0;
        while (offset < bytes.length) {
          const n = await socket!.write(bytes.subarray(offset));
          if (n <= 0 || n > bytes.length - offset) throw Error('SMTP_IO');
          offset += n;
        }
      };
      const line = async () => {
        while (!pending.includes('\r\n')) {
          const buffer = new Uint8Array(2048),
            n = await socket!.read(buffer);
          if (n === null || n <= 0) throw Error('SMTP_IO');
          pending += new TextDecoder().decode(buffer.subarray(0, n));
          if (pending.length > 16384) throw Error('SMTP_RESPONSE_LIMIT');
        }
        const at = pending.indexOf('\r\n'),
          value = pending.slice(0, at);
        pending = pending.slice(at + 2);
        return value;
      };
      const reply = async (codes: readonly number[]) => {
        let first: number | undefined;
        for (let i = 0; i < 32; i++) {
          const match = /^(\d{3})([ -])/.exec(await line());
          if (!match) throw Error('SMTP_RESPONSE');
          const code = Number(match[1]);
          if (first !== undefined && first !== code)
            throw Error('SMTP_RESPONSE');
          first = code;
          if (match[2] === ' ') {
            if (!codes.includes(code)) throw new SmtpRejected('SMTP_REJECTED');
            return;
          }
        }
        throw Error('SMTP_RESPONSE_LIMIT');
      };
      async function exchange() {
        const opened = await connect();
        if (finished) {
          opened.close();
          throw Error('SMTP_TIMEOUT');
        }
        socket = opened;
        await reply([220]);
        await write('EHLO app-barberia.local\r\n');
        await reply([250]);
        await write(`MAIL FROM:<${options.from}>\r\n`);
        await reply([250]);
        await write(`RCPT TO:<${value.to}>\r\n`);
        await reply([250, 251]);
        await write('DATA\r\n');
        await reply([354]);
        const content = new TextEncoder().encode(value.text),
          encoded =
            btoa(Array.from(content, (b) => String.fromCharCode(b)).join(''))
              .match(/.{1,76}/g)
              ?.join('\r\n') ?? '';
        const message = [
          `From: ${options.from}`,
          `To: ${value.to}`,
          'Subject: Invitacion para administrar una barberia',
          `Message-ID: <admin-${teamId(envelope.invitationId)}@example.invalid>`,
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          encoded,
          '',
        ].join('\r\n');
        transmitted = true;
        await write(message + '.\r\n');
        await reply([250]);
        acknowledged = true;
        try {
          await write('QUIT\r\n');
          await reply([221]);
        } catch {
          /* Acknowledged DATA remains accepted even if QUIT fails. */
        }
      }
      try {
        await Promise.race([
          exchange(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(
              () => reject(Error('SMTP_TIMEOUT')),
              options.timeoutMs ?? 8000,
            );
          }),
        ]);
        return 'sent';
      } catch (e) {
        return acknowledged
          ? 'sent'
          : e instanceof SmtpRejected
            ? 'failed'
            : transmitted
              ? 'unknown'
              : 'failed';
      } finally {
        finished = true;
        if (timer !== undefined) clearTimeout(timer);
        if (socket)
          try {
            (socket as SmtpSocket).close();
          } catch {
            /* No sensitive diagnostics are logged. */
          }
      }
    },
  };
}
