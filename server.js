const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data.json');
const COMPLETED_FILE = path.join(ROOT, 'completed.json');
const HABITS_FILE = path.join(ROOT, 'habits.json');
const MAX_COMPLETED_BYTES = 1 * 1024 * 1024; // 1MB — oldest entries are pruned past this

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
};

function defaultData() {
  return { events: [], categories: [], todos: [] };
}

function defaultHabits() {
  return { habits: [], habitLog: {} };
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function handleGetData(res) {
  fs.readFile(DATA_FILE, 'utf8', (err, content) => {
    if (err) return sendJson(res, 200, defaultData());
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(content);
  });
}

function handlePostData(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 5e6) req.destroy();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), err => {
        if (err) return sendJson(res, 500, { ok: false, error: err.message });
        sendJson(res, 200, { ok: true });
      });
    } catch (e) {
      sendJson(res, 400, { ok: false, error: e.message });
    }
  });
}

function handleGetHabits(res) {
  fs.readFile(HABITS_FILE, 'utf8', (err, content) => {
    if (err) return sendJson(res, 200, defaultHabits());
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(content);
  });
}

function handlePostHabits(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 5e6) req.destroy();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      fs.writeFile(HABITS_FILE, JSON.stringify(data, null, 2), err => {
        if (err) return sendJson(res, 500, { ok: false, error: err.message });
        sendJson(res, 200, { ok: true });
      });
    } catch (e) {
      sendJson(res, 400, { ok: false, error: e.message });
    }
  });
}

function handleGetCompleted(res) {
  fs.readFile(COMPLETED_FILE, 'utf8', (err, content) => {
    if (err) return sendJson(res, 200, []);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(content);
  });
}

// Drops the oldest entries until the archive fits under MAX_COMPLETED_BYTES
function pruneCompleted(list) {
  while (list.length > 1 && Buffer.byteLength(JSON.stringify(list), 'utf8') > MAX_COMPLETED_BYTES) {
    list.splice(0, Math.ceil(list.length * 0.2));
  }
  return list;
}

function handlePostCompleted(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 5e6) req.destroy();
  });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      return sendJson(res, 400, { ok: false, error: e.message });
    }
    fs.readFile(COMPLETED_FILE, 'utf8', (err, content) => {
      let list = [];
      if (!err) {
        try { list = JSON.parse(content); } catch (e) { list = []; }
      }
      list.push(payload.event);
      list = pruneCompleted(list);
      fs.writeFile(COMPLETED_FILE, JSON.stringify(list, null, 2), err => {
        if (err) return sendJson(res, 500, { ok: false, error: err.message });
        sendJson(res, 200, { ok: true, count: list.length });
      });
    });
  });
}

function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0];
  const relPath = urlPath === '/' ? '/Planner.html' : decodeURIComponent(urlPath);
  const filePath = path.join(ROOT, relPath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  if (urlPath === '/api/data') {
    if (req.method === 'GET') return handleGetData(res);
    if (req.method === 'POST') return handlePostData(req, res);
    res.writeHead(405);
    return res.end('Method not allowed');
  }
  if (urlPath === '/api/completed') {
    if (req.method === 'GET') return handleGetCompleted(res);
    if (req.method === 'POST') return handlePostCompleted(req, res);
    res.writeHead(405);
    return res.end('Method not allowed');
  }
  if (urlPath === '/api/habits') {
    if (req.method === 'GET') return handleGetHabits(res);
    if (req.method === 'POST') return handlePostHabits(req, res);
    res.writeHead(405);
    return res.end('Method not allowed');
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Weekly Planner running at http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
