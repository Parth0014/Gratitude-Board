import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

// Liveness only. Never claims database or downstream readiness.
export const handler: APIGatewayProxyHandlerV2 = async () => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify({ status: 'ok', service: 'api' }),
});
