import { execFileSync } from 'node:child_process';
import http from 'node:http';
import { Buffer } from 'node:buffer';
import { networkInterfaces } from 'node:os';
import { pathToFileURL } from 'node:url';

const name = 'supabase_auth_app-barberia-002-local';
const network = 'supabase_network_app-barberia-002-local';
const backup = `${name}_recovery_backup`;
const changed = new Set([
  'API_EXTERNAL_URL',
  'GOTRUE_MAILER_URLPATHS_CONFIRMATION',
  'GOTRUE_MAILER_URLPATHS_RECOVERY',
]);
export function replacement(original, origin) {
  const target = new URL(origin);
  const parts = target.hostname.split('.').map(Number);
  if (
    target.protocol !== 'http:' ||
    target.port !== '54421' ||
    target.origin !== origin ||
    parts.length !== 4 ||
    !parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) ||
    !(
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    )
  )
    throw Error('LOCAL_ORIGIN_REQUIRED');
  if (
    original.Name !== `/${name}` ||
    original.Mounts.length ||
    original.HostConfig.NetworkMode !== network ||
    Object.keys(original.NetworkSettings.Networks).join() !== network
  )
    throw Error('ISOLATION_GUARD');
  if (!original.Config.Env.includes('GOTRUE_MAILER_AUTOCONFIRM=false'))
    throw Error('CONFIRMATION_GUARD');
  const config = structuredClone(original.Config);
  for (const key of changed)
    if (!config.Env.some((s) => s.startsWith(`${key}=`)))
      throw Error('EXPECTED_ENV_MISSING');
  config.Env = config.Env.map((pair) => {
    const key = pair.slice(0, pair.indexOf('='));
    return key === 'API_EXTERNAL_URL'
      ? `${key}=${origin}/auth/v1`
      : [
            'GOTRUE_MAILER_URLPATHS_CONFIRMATION',
            'GOTRUE_MAILER_URLPATHS_RECOVERY',
          ].includes(key)
        ? `${key}=/auth/v1/verify`
        : pair;
  });
  return {
    ...config,
    HostConfig: structuredClone(original.HostConfig),
    NetworkingConfig: { EndpointsConfig: { [network]: endpoint(original) } },
  };
}
function endpoint(original) {
  const e = original.NetworkSettings.Networks[network];
  return {
    Aliases: (e.Aliases ?? []).filter(
      (a) => a !== original.Id && a !== original.Id.slice(0, 12),
    ),
    IPAMConfig: { IPv4Address: e.IPAddress },
  };
}
const docker = (args) =>
  JSON.parse(
    execFileSync('docker', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  );
function request(socketPath, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const req = http.request(
      {
        socketPath,
        method,
        path,
        headers: data
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data),
            }
          : {},
      },
      (res) => {
        let result = '';
        res.on('data', (d) => (result += d));
        res.on('end', () => {
          if (res.statusCode >= 300)
            return reject(Error(`DOCKER_HTTP_${res.statusCode}`));
          try {
            resolve(result ? JSON.parse(result) : null);
          } catch {
            reject(Error('DOCKER_RESPONSE'));
          }
        });
      },
    );
    req.on('error', () => reject(Error('DOCKER_CONNECTION')));
    req.setTimeout(20000, () => req.destroy());
    req.end(data);
  });
}
async function main() {
  const [action, origin] = process.argv.slice(2);
  if (!['apply', 'revert'].includes(action))
    throw Error('USAGE_APPLY_OR_REVERT');
  const context = docker(['context', 'inspect'])[0].Endpoints.docker.Host;
  if (context !== 'npipe:////./pipe/dockerDesktopLinuxEngine')
    throw Error('LOCAL_DOCKER_REQUIRED');
  const api = (method, path, body) =>
    request('\\\\.\\pipe\\dockerDesktopLinuxEngine', method, path, body);
  const inspect = async (n) => api('GET', `/containers/${n}/json`);
  const old = await inspect(action === 'apply' ? name : backup);
  const networkState = () => api('GET', `/networks/${network}`);
  const owners = (state, ip) =>
    Object.entries(state.Containers ?? {})
      .filter(([, v]) => v.IPv4Address?.split('/')[0] === ip)
      .map(([id]) => id);
  if (action === 'apply') {
    if (
      origin !== 'http://192.168.0.16:54421' ||
      !old.State.Running ||
      old.NetworkSettings.Networks[network]?.IPAddress !== '172.19.0.2' ||
      !old.NetworkSettings.Networks[network]?.Aliases?.includes('auth')
    )
      throw Error('APPROVED_TARGET_CHANGED');
    const assigned = owners(await networkState(), '172.19.0.2');
    if (assigned.length !== 1 || assigned[0] !== old.Id)
      throw Error('IP_OWNER_MISMATCH');
    const ip = new URL(origin).hostname;
    if (
      !Object.values(networkInterfaces())
        .flat()
        .some((n) => n?.address === ip && !n.internal)
    )
      throw Error('LAN_IP_NOT_CURRENT');
    const body = replacement(old, origin);
    const containers = await api('GET', '/containers/json?all=true');
    if (containers.some((c) => c.Names.includes(`/${backup}`)))
      throw Error('BACKUP_ALREADY_EXISTS');
    let stopped = false,
      renamed = false,
      disconnected = false,
      created;
    try {
      await api('POST', `/containers/${old.Id}/stop?t=10`);
      stopped = true;
      await api('POST', `/containers/${old.Id}/rename?name=${backup}`);
      renamed = true;
      await api('POST', `/networks/${network}/disconnect`, {
        Container: old.Id,
      });
      disconnected = true;
      if (owners(await networkState(), '172.19.0.2').length)
        throw Error('IP_NO_LONGER_FREE');
      created = (await api('POST', `/containers/create?name=${name}`, body)).Id;
      await api('POST', `/containers/${created}/start`);
      await health();
      const effective = await inspect(name);
      if (
        !effective.State.Running ||
        effective.Image !== old.Image ||
        effective.NetworkSettings.Networks[network]?.IPAddress !==
          '172.19.0.2' ||
        !effective.NetworkSettings.Networks[network]?.Aliases?.includes(
          'auth',
        ) ||
        effective.Mounts.length !== old.Mounts.length
      )
        throw Error('REPLACEMENT_ISOLATION_MISMATCH');
      for (const [key, value] of Object.entries(body)) {
        if (key === 'HostConfig' || key === 'NetworkingConfig') continue;
        if (JSON.stringify(effective.Config[key]) !== JSON.stringify(value))
          throw Error('CONFIG_PRESERVATION_FAILED');
      }
      for (const key of [
        'PortBindings',
        'Binds',
        'RestartPolicy',
        'NetworkMode',
        'Privileged',
        'ReadonlyRootfs',
        'CapAdd',
        'CapDrop',
        'SecurityOpt',
      ])
        if (
          JSON.stringify(effective.HostConfig[key]) !==
          JSON.stringify(old.HostConfig[key])
        )
          throw Error('HOST_CONFIG_CHANGED');
      const saved = await inspect(backup);
      if (saved.Id !== old.Id || saved.State.Running)
        throw Error('BACKUP_NOT_PRESERVED');
      const stable = (env) =>
        env.filter((s) => !changed.has(s.slice(0, s.indexOf('='))));
      if (
        JSON.stringify(stable(old.Config.Env)) !==
        JSON.stringify(stable(effective.Config.Env))
      )
        throw Error('UNEXPECTED_ENV_CHANGE');
      console.log(
        JSON.stringify({
          action,
          origin,
          health200: true,
          lanHealth200: true,
          aliasAuthPreserved: true,
          imageAndConfigPreserved: true,
          changedEnvironmentNames: [...changed],
          otherEnvironmentPreserved: true,
          siteRedirectsJwtSmtpPreserved: true,
          rollbackContainer: backup,
        }),
      );
    } catch (error) {
      if (created) await api('DELETE', `/containers/${created}?force=true`);
      if (renamed)
        await api('POST', `/containers/${old.Id}/rename?name=${name}`);
      if (disconnected)
        await api('POST', `/networks/${network}/connect`, {
          Container: old.Id,
          EndpointConfig: endpoint(old),
        });
      if (stopped) await api('POST', `/containers/${old.Id}/start`);
      await health();
      console.log(
        JSON.stringify({
          action: 'rollback',
          originalRestored: true,
          health200: true,
          failureCode: /^[A-Z0-9_]+$/.test(error?.message ?? '')
            ? error.message
            : 'CHECK_FAILED',
        }),
      );
      throw error;
    }
  } else {
    if (
      old.Name !== `/${backup}` ||
      old.Mounts.length ||
      old.HostConfig.NetworkMode !== network
    )
      throw Error('ROLLBACK_GUARD');
    const current = await inspect(name);
    replacement(current, 'http://192.168.0.1:54421'); // Verify exact target and no mounted data before removal.
    await api('POST', `/containers/${current.Id}/stop?t=10`);
    await api('DELETE', `/containers/${current.Id}`);
    await api('POST', `/containers/${old.Id}/rename?name=${name}`);
    // Original address is retained as the replacement's current address.
    await api('POST', `/networks/${network}/connect`, {
      Container: old.Id,
      EndpointConfig: endpoint(current),
    });
    await api('POST', `/containers/${old.Id}/start`);
    await health();
    console.log(JSON.stringify({ action, health200: true }));
  }
}
async function health() {
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const responses = await Promise.all(
        ['127.0.0.1', '192.168.0.16'].map((host) =>
          fetch('http://' + host + ':54421/auth/v1/health', {
            signal: AbortSignal.timeout(2000),
          }),
        ),
      );
      if (responses.every((r) => r.status === 200)) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw Error('AUTH_NOT_READY');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => {
    console.error(
      'LOCAL_AUTH_OPERATION_FAILED; inspect service status without exposing environment values.',
    );
    process.exitCode = 1;
  });
