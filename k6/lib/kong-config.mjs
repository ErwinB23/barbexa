export function tuneNginx(source) {
  const blocks = [...source.matchAll(/^events\s*\{([^{}]*)\}/gm)];
  if (blocks.length !== 1) throw Error('UNSUPPORTED_NGINX_EVENTS_TEMPLATE');
  const body = blocks[0][1].replace(
    /^[\t ]*worker_connections\s+\S+;[^\S\n]*\n/gm,
    '',
  );
  return source.replace(
    blocks[0][0],
    `events {\n    worker_connections 4096;${body}` + '}',
  );
}
export function tuneEntrypoint(source) {
  if (source.includes('# BARBEXA_K6_CONNECTIONS_4096')) return source;
  const anchor = 'set -Eeo pipefail\n';
  if (!source.includes(anchor)) throw Error('UNSUPPORTED_KONG_ENTRYPOINT');
  // This container's original sh command regenerates the template before entering here.
  const hook = `
# BARBEXA_K6_CONNECTIONS_4096: isolated laboratory only; preserve the image entrypoint.
if [[ "\${1:-}" == "kong" && "\${2:-}" == "docker-start" ]]; then
  test -f /home/kong/custom_nginx.template
  sed -i '/^[[:space:]]*worker_connections[[:space:]]/d; /^events[[:space:]]*{/a\\    worker_connections 4096;' /home/kong/custom_nginx.template
fi
`;
  return source.replace(anchor, anchor + hook);
}
export function assertDescriptorLimit(text) {
  const m = /Max open files\s+(\d+|unlimited)\s+(\d+|unlimited)/.exec(text);
  if (!m || m.slice(1).some((v) => v !== 'unlimited' && +v < 8192))
    throw Error('INSUFFICIENT_OR_UNKNOWN_DESCRIPTOR_LIMIT');
}
