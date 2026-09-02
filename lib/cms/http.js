import { allowedOrigins } from './env.js';

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (origin && allowedOrigins().includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    response.setHeader('Vary', 'Origin');
  }
}

export function options(request, response) {
  applyCors(request, response);
  response.status(204).end();
}

export function json(request, response, body, status = 200, additionalHeaders = {}) {
  applyCors(request, response);
  response.setHeader('Allow', 'GET, POST, PATCH, OPTIONS');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [name, value] of Object.entries(additionalHeaders)) {
    response.setHeader(name, value);
  }
  response.status(status).json(body);
}

export function errorResponse(request, response, error, status = 500) {
  return json(request, response, { error }, status);
}