import { createServer, type ServerResponse } from "node:http";

const DEFAULT_PORT = 3000;
const portValue = process.env.PORT;
const port = portValue ? Number(portValue) : DEFAULT_PORT;

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, string>,
): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  sendJson(response, 404, { error: "Route not found" });
});

server.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
