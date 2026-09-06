const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const LEADS_FILE = path.join(__dirname, 'leads.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // Rota de API para recebimento e salvamento local de leads
  if (req.method === 'POST' && req.url === '/api/submit') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const lead = JSON.parse(body);
        lead.receivedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        let leads = [];
        if (fs.existsSync(LEADS_FILE)) {
          try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch(e) {}
        }
        leads.push(lead);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');

        console.log(`[NOVO LEAD RECEBIDO] Nome: ${lead.name} | E-mail: ${lead.email} | WhatsApp: ${lead.phone}`);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ status: 'success', message: 'Lead salvo com sucesso!' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ status: 'error', message: err.message }));
      }
    });
    return;
  }

  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0]; // remove query params
  
  const filePath = path.join(PUBLIC_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('404 - Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('500 - Internal Server Error');
      }
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`GLA MORNING rodando em: http://localhost:${PORT}`);
});
