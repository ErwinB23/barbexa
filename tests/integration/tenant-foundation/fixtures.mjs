import fs from 'node:fs';
import { Buffer } from 'node:buffer';
import path from 'node:path';
import os from 'node:os';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const owners = new Map();
const tempRoot = fs.realpathSync(os.tmpdir());

export function assertLocalTarget({ url, projectId, expectedPort = 54421 }) {
  if (
    typeof projectId !== 'string' ||
    !/^app-barberia-002-[a-z0-9-]+$/.test(projectId)
  )
    throw Error('UNIDENTIFIED_PROJECT');
  if (
    !Number.isInteger(expectedPort) ||
    expectedPort < 1024 ||
    expectedPort > 65535 ||
    (expectedPort >= 54320 && expectedPort <= 54329)
  )
    throw Error('UNSAFE_PORT');
  const target = new URL(url);
  if (
    target.protocol !== 'http:' ||
    !['127.0.0.1', '[::1]'].includes(target.hostname) ||
    Number(target.port) !== expectedPort ||
    target.username ||
    target.password ||
    target.pathname !== '/' ||
    target.search ||
    target.hash
  )
    throw Error('UNSAFE_LOCAL_TARGET');
  return target;
}

export function publicSettings(input) {
  const allowed = ['url', 'projectId', 'publicKey', 'accessToken'];
  if (Object.keys(input).some((k) => !allowed.includes(k)))
    throw Error('PRIVATE_SETTINGS_REJECTED');
  assertLocalTarget(input);
  if (
    typeof input.publicKey !== 'string' ||
    typeof input.accessToken !== 'string' ||
    !input.accessToken.trim()
  )
    throw Error('PUBLIC_SETTINGS_REQUIRED');
  if (input.accessToken.startsWith('sb_secret_'))
    throw Error('PRIVILEGED_TOKEN_REJECTED');
  if (input.accessToken.split('.').length === 3) {
    let claim;
    try {
      claim = JSON.parse(
        Buffer.from(input.accessToken.split('.')[1], 'base64url').toString(),
      );
    } catch {
      throw Error('INVALID_TOKEN_SHAPE');
    }
    if (claim.role !== 'authenticated')
      throw Error('PRIVILEGED_TOKEN_REJECTED');
  }
  if (!input.publicKey.startsWith('sb_publishable_')) {
    let claim;
    try {
      claim = JSON.parse(
        Buffer.from(input.publicKey.split('.')[1], 'base64url').toString(),
      );
    } catch {
      throw Error('PUBLIC_KEY_REQUIRED');
    }
    // This only rejects privileged credentials; it does not authenticate a JWT.
    if (claim.role !== 'anon') throw Error('PRIVILEGED_KEY_REJECTED');
  }
  return Object.freeze({ ...input });
}

export function fixtureCredentials() {
  return {
    email: randomBytes(12).toString('hex') + '@example.invalid',
    password: randomBytes(32).toString('base64url'),
  };
}

export function createOwnedDirectory() {
  const dir = fs.mkdtempSync(path.join(tempRoot, 'barberia-002-'));
  const token = randomBytes(24).toString('hex');
  fs.writeFileSync(path.join(dir, '.barberia-owner'), token, { flag: 'wx' });
  owners.set(dir, token);
  return dir;
}

export function removeOwnedDirectory(dir) {
  if (
    !owners.has(dir) ||
    path.dirname(dir) !== tempRoot ||
    !path.basename(dir).startsWith('barberia-002-') ||
    fs.lstatSync(dir).isSymbolicLink() ||
    fs.realpathSync(dir) !== dir
  )
    throw Error('UNOWNED_OUTPUT');
  function inspect(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name),
        s = fs.lstatSync(f);
      if (s.isSymbolicLink()) throw Error('OUTPUT_LINK_REJECTED');
      if (s.isDirectory()) inspect(f);
    }
  }
  inspect(dir);
  if (
    fs.readFileSync(path.join(dir, '.barberia-owner'), 'utf8') !==
    owners.get(dir)
  )
    throw Error('UNOWNED_OUTPUT');
  // Resolved absolute target, parent, ownership and nested links verified above.
  fs.rmSync(dir, { recursive: true });
  owners.delete(dir);
}

export function runChecked(
  executable,
  args,
  { timeout = 30000, cwd = process.cwd(), env = process.env } = {},
) {
  const r = spawnSync(executable, args, {
    cwd,
    env,
    timeout,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    shell: false,
  });
  if (r.error?.code === 'ETIMEDOUT') throw Error('SUBPROCESS_TIMEOUT');
  if (r.error || r.status !== 0) throw Error('SUBPROCESS_FAILED');
  return r.stdout;
}
