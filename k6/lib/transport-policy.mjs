// Authorized methodology: only absent transport responses ending in EOF, only Stress reads.
// No HTTP 5xx/4xx, auth failures, malformed payloads, other transports or writes are relaxed.
export function isStressTransportEOF(type, mode, response) {
  return (
    type === 'stress' &&
    mode === 'read' &&
    response.status === 0 &&
    /(?:^|:\s*)(?:unexpected\s+)?EOF\s*$/i.test(response.error || '')
  );
}
