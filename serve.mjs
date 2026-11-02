// Local server for the dashboard: serves index.html and proxies GitHub GraphQL with the token
// from the environment, so the token never reaches the browser. No dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const token = process.env.TOKEN_GITHUB || '';
const repos = (process.env.REPOS || '').split(/[\s,]+/).filter((r) => /^[\w.-]+\/[\w.-]+$/.test(r));
const port = Number(process.env.PORT) || 8080;
const page = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), 'index.html');

if (!token) console.warn('TOKEN_GITHUB is not set; GitHub requests will fail.');

const send = (res, status, type, body) => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
};

http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return send(res, 200, 'text/html; charset=utf-8', fs.readFileSync(page));
    }
    if (req.method === 'GET' && req.url === '/api/config') {
      return send(res, 200, 'application/json', JSON.stringify({ repos, hasToken: !!token }));
    }
    if (req.method === 'POST' && req.url === '/api/graphql') {
      let body = '';
      for await (const chunk of req) body += chunk;
      const gh = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: 'bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'pmo-dashboard' },
        body,
      });
      return send(res, gh.status, 'application/json', await gh.text());
    }
    send(res, 404, 'text/plain', 'Not found');
  } catch (e) {
    send(res, 502, 'text/plain', e.message);
  }
}).listen(port, () => console.log(`Dashboard on http://localhost:${port}`));
