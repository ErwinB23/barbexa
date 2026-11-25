const origin = window.location.origin;
window.ui = SwaggerUIBundle({
  url: '/openapi.json',
  dom_id: '#swagger-ui',
  deepLinking: true,
  displayOperationId: true,
  supportedSubmitMethods: [],
  validatorUrl: null,
  persistAuthorization: false,
  queryConfigEnabled: false,
  requestInterceptor(request) {
    const url = new URL(request.url, origin);
    if (
      url.origin !== origin ||
      url.pathname !== '/openapi.json' ||
      (request.method && request.method.toUpperCase() !== 'GET')
    ) {
      throw new Error('Ejecución API deshabilitada en esta documentación.');
    }
    return request;
  },
  presets: [SwaggerUIBundle.presets.apis],
});
