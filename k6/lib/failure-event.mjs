// Sanitized diagnostic only. Does not alter checks, retries, thresholds or aborts.
export function failureEvent({
  operation,
  path,
  response,
  body,
  vu,
  iteration,
  elapsed,
}) {
  const classification =
    response.status === 0
      ? 'technical-transport'
      : response.status >= 500 ||
          response.status === 429 ||
          (response.status >= 300 && response.status < 400)
        ? 'technical-http'
        : [401, 403].includes(response.status)
          ? 'authorization'
          : 'functional-or-contract';
  return {
    event: 'unexpected-request',
    utc: new Date().toISOString(),
    operation,
    endpoint: path.split('?')[0],
    status: response.status,
    errorCode: response.error_code ?? null,
    classification,
    requestId: operation === 'confirm' ? (body?.requestId ?? null) : null,
    vu,
    iteration,
    scenarioElapsedSeconds: elapsed,
    retry: false,
  };
}
