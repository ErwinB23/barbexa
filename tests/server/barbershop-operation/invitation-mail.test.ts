import {
  createLocalInvitationMail,
  createResendInvitationMail,
} from '../../../supabase/functions/_shared/barbershop-operation/infrastructure/invitation-mail-adapter.ts';
const id = '11111111-1111-4111-8111-111111111111';
const envelope = {
  invitationId: id,
  recipientEmail: 'test@example.invalid',
  barbershopName: 'Local <script>',
  expiresAt: '2026-11-22T12:00:00.000Z',
};
function socket(transcript: string) {
  let bytes = new TextEncoder().encode(transcript);
  let closed = false;
  const sent: string[] = [];
  return {
    sent,
    isClosed: () => closed,
    connection: {
      async read(buffer: Uint8Array) {
        if (!bytes.length) return null;
        const n = Math.min(buffer.length, bytes.length);
        buffer.set(bytes.subarray(0, n));
        bytes = bytes.subarray(n);
        return n;
      },
      async write(buffer: Uint8Array) {
        const n = Math.min(9, buffer.length);
        sent.push(new TextDecoder().decode(buffer.subarray(0, n)));
        return n;
      },
      close() {
        closed = true;
      },
    },
  };
}
Deno.test(
  'LOCAL Mailpit accepts exactly the two fictional recipient domains',
  async () => {
    for (const recipientEmail of [
      'test@example.invalid',
      'test@example.test',
      'test@EXAMPLE.TEST',
    ]) {
      const s = socket(
        '220 local\r\n250 OK\r\n250 OK\r\n250 OK\r\n354 send\r\n250 accepted\r\n221 bye\r\n',
      );
      let connections = 0;
      const adapter = createLocalInvitationMail({
        development: true,
        from: 'no-reply@example.invalid',
        webOrigin: 'http://localhost:8081',
        connector: async () => {
          connections++;
          return s.connection;
        },
      });
      if (
        (await adapter.send({ ...envelope, recipientEmail }, id)) !== 'sent' ||
        connections !== 1 ||
        !s.sent.join('').includes(`RCPT TO:<${recipientEmail}>\r\n`)
      )
        throw Error('fictional recipient rejected');
    }
  },
);
Deno.test(
  'LOCAL recipient allowlist rejects external domains and partial matches before SMTP',
  async () => {
    let connections = 0;
    const adapter = createLocalInvitationMail({
      development: true,
      from: 'no-reply@example.invalid',
      webOrigin: 'http://localhost:8081',
      connector: async () => {
        connections++;
        throw Error('must not connect');
      },
    });
    for (const recipientEmail of [
      'test@example.com',
      'test@gmail.com',
      'test@sub.example.test',
      'test@example.test.evil.invalid',
      'test@example.invalid.evil.test',
      'test@fakeexample.test',
      'test@example.com@example.test',
      'test@example.test\r\nBcc:other@example.test',
    ]) {
      let rejected = false;
      try {
        await adapter.send({ ...envelope, recipientEmail }, id);
      } catch {
        rejected = true;
      }
      if (!rejected) throw Error('unsafe recipient accepted');
    }
    if (connections !== 0) throw Error('invalid recipient reached SMTP');
  },
);
Deno.test(
  'LOCAL mail domain extension never enables the adapter outside development',
  () => {
    for (const from of ['no-reply@example.invalid', 'no-reply@example.test']) {
      let rejected = false;
      try {
        createLocalInvitationMail({
          development: false,
          from,
          webOrigin: 'https://app.example.invalid',
        });
      } catch {
        rejected = true;
      }
      if (!rejected) throw Error('production SMTP enabled');
    }
  },
);
Deno.test(
  'Mailpit SMTP supports multiline replies/partial writes, local-only guard and closes without logging recipients',
  async () => {
    const s = socket(
      '220 local\r\n250-local\r\n250 OK\r\n250 OK\r\n250 OK\r\n354 send\r\n250 accepted\r\n221 bye\r\n',
    );
    const adapter = createLocalInvitationMail({
      development: true,
      from: 'no-reply@example.invalid',
      webOrigin: 'http://localhost:8081',
      connector: async () => s.connection,
    });
    if (
      (await adapter.send(envelope, 'admin-invitation/' + id)) !== 'sent' ||
      !s.isClosed()
    )
      throw Error('SMTP');
    if (
      !s.sent.join('').includes('MAIL FROM:<no-reply@example.invalid>\r\n') ||
      !s.sent.join('').endsWith('QUIT\r\n')
    )
      throw Error('framing');
    let denied = false;
    try {
      createLocalInvitationMail({
        development: false,
        from: 'no-reply@example.invalid',
        webOrigin: 'http://localhost:8081',
      });
    } catch {
      denied = true;
    }
    if (!denied) throw Error('production SMTP bypass');
  },
);
Deno.test(
  'SMTP distinguishes refusal before delivery from unknown post-DATA outcome',
  async () => {
    for (const [tail, expected] of [
      ['550 rejected\r\n', 'failed'],
      ['354 send\r\n', 'unknown'],
    ] as const) {
      const s = socket('220 local\r\n250 OK\r\n250 OK\r\n250 OK\r\n' + tail);
      const adapter = createLocalInvitationMail({
        development: true,
        from: 'no-reply@example.invalid',
        webOrigin: 'http://localhost:8081',
        connector: async () => s.connection,
      });
      if ((await adapter.send(envelope, id)) !== expected || !s.isClosed())
        throw Error('unsafe retry result');
    }
  },
);
Deno.test(
  'Resend fixes HTTPS destination and stable idempotency; transport failure never means sent',
  async () => {
    let calls = 0;
    const adapter = createResendInvitationMail({
      apiKey: 're_fixture',
      from: 'no-reply@example.invalid',
      webOrigin: 'https://app.example.invalid',
      fetcher: async (url, init) => {
        calls++;
        if (
          String(url) !== 'https://api.resend.com/emails' ||
          new Headers(init?.headers).get('Idempotency-Key') !==
            'admin-invitation/' + id
        )
          throw Error('request');
        return Response.json({ id: 'message-fixture' });
      },
    });
    if (
      (await adapter.send(envelope, 'admin-invitation/' + id)) !== 'sent' ||
      calls !== 1
    )
      throw Error('provider');
    const failed = createResendInvitationMail({
      apiKey: 're_fixture',
      from: 'no-reply@example.invalid',
      webOrigin: 'https://app.example.invalid',
      fetcher: async () => {
        throw Error('private provider info');
      },
    });
    if ((await failed.send(envelope, id)) !== 'unknown')
      throw Error('false success');
  },
);
Deno.test(
  'Resend refuses automatic redirect of private invitation payloads',
  async () => {
    let redirect: RequestRedirect | undefined;
    const adapter = createResendInvitationMail({
      apiKey: 're_fixture',
      from: 'no-reply@example.invalid',
      webOrigin: 'https://app.example.invalid',
      fetcher: async (_url, init) => {
        redirect = init?.redirect;
        throw new TypeError('Redirect rejected');
      },
    });
    if ((await adapter.send(envelope, id)) !== 'unknown')
      throw Error('redirect is not a confirmed send');
    if (redirect !== 'error')
      throw Error('private payload could follow redirect');
  },
);
Deno.test(
  'Resend response without a nonempty message identifier is uncertain',
  async () => {
    for (const data of [{}, { id: '' }, { id: '  ' }, { id: null }]) {
      const adapter = createResendInvitationMail({
        apiKey: 're_fixture',
        from: 'no-reply@example.invalid',
        webOrigin: 'https://app.example.invalid',
        fetcher: async () => Response.json(data),
      });
      if ((await adapter.send(envelope, id)) !== 'unknown')
        throw Error('missing acknowledgement must not appear as sent');
    }
  },
);
