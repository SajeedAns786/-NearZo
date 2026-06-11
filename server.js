const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

const PORT = 8000;

// Load environment variables from .env file
if (fs.existsSync('.env')) {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split(/\r?\n/).forEach(line => {
    if (!line || line.startsWith('#')) return;
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = value;
    }
  });
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'nearzoadmin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'nearzo_default_secret_key_129837';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

// Cookie helper
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });
  }
  return list;
}

// Session signing/verification
function signSession(username) {
  const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const data = `${username}:${expiry}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');
  return `${data}:${signature}`;
}

function verifySession(sessionCookie) {
  if (!sessionCookie) return false;
  const parts = sessionCookie.split(':');
  if (parts.length !== 3) return false;
  const [username, expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || expiry < Date.now()) return false;
  
  const data = `${username}:${expiry}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(data);
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}

function isAdminAuthenticated(req) {
  const cookies = parseCookies(req);
  return verifySession(cookies.admin_session);
}

// Read body stream
function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

// Helper to query Firestore REST API
function fetchFirestoreCollection(collectionName) {
  return new Promise((resolve, reject) => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId || projectId === 'nearzo-app') {
      return reject(new Error('FIREBASE_PROJECT_ID is not fully configured'));
    }
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?pageSize=20`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'NodeJS-Server'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => {
      reject(err);
    });
  });
}

// Main HTTP Server
http.createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0].split('#')[0];
  
  // Custom API & Admin Routing
  if (urlPath === '/admin' || urlPath === '/admin/') {
    if (isAdminAuthenticated(req)) {
      res.writeHead(302, { 'Location': '/admin/dashboard' });
      res.end();
    } else {
      fs.readFile('./admin-login.html', (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading admin-login.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
    }
    return;
  }
  
  if (urlPath === '/admin/dashboard' || urlPath === '/admin/dashboard/') {
    if (!isAdminAuthenticated(req)) {
      res.writeHead(302, { 'Location': '/admin' });
      res.end();
    } else {
      fs.readFile('./admin-dashboard.html', (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading admin-dashboard.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
    }
    return;
  }
  
  // POST Login endpoint
  if (urlPath === '/api/admin/login' && req.method === 'POST') {
    try {
      const bodyText = await readBody(req);
      const reqContentType = req.headers['content-type'] || '';
      let params = {};
      
      if (reqContentType.includes('application/json')) {
        params = JSON.parse(bodyText);
      } else {
        params = querystring.parse(bodyText);
      }
      
      const { username, password } = params;
      
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const sessionToken = signSession(username);
        res.writeHead(200, {
          'Set-Cookie': `admin_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid Admin username or password.' }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Internal server error during login.' }));
    }
    return;
  }
  
  // POST Logout endpoint
  if (urlPath === '/api/admin/logout' && req.method === 'POST') {
    res.writeHead(200, {
      'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ success: true }));
    return;
  }
  
  // GET Stats API endpoint
  if (urlPath === '/api/admin/stats' && req.method === 'GET') {
    if (!isAdminAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Unauthorized access.' }));
      return;
    }
    
    // Attempt to pull real data from Firestore or use high-fidelity mock fallback
    let firestoreData = null;
    let useMock = false;
    
    try {
      // We can try to query 'dealers' collection or 'users' collection
      firestoreData = await fetchFirestoreCollection('dealers');
    } catch (e) {
      useMock = true;
    }
    
    // Compile dashboard statistics
    const stats = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDealers: firestoreData ? (firestoreData.documents ? firestoreData.documents.length : 0) : 184,
        activeBids: 48,
        appDownloads: 1420,
        inquiriesCount: 12
      },
      dealers: firestoreData && firestoreData.documents ? firestoreData.documents.map(doc => {
        // Map Firestore doc structure (fields) to clean JSON
        const fields = doc.fields || {};
        return {
          name: fields.name && fields.name.stringValue ? fields.name.stringValue : 'Tyre Partner',
          phone: fields.phone && fields.phone.stringValue ? fields.phone.stringValue : 'Unknown Phone',
          city: fields.city && fields.city.stringValue ? fields.city.stringValue : 'India',
          status: fields.status && fields.status.stringValue ? fields.status.stringValue : 'Verified',
          created: doc.createTime || new Date().toISOString()
        };
      }) : [
        { name: 'Metro Tyres Ltd', phone: '+91 98765 43210', city: 'Delhi', status: 'Verified', created: '2026-06-11T12:00:00Z' },
        { name: 'Apex Rubber Works', phone: '+91 91234 56789', city: 'Mumbai', status: 'Verified', created: '2026-06-11T10:15:00Z' },
        { name: 'Sai Ram Enterprises', phone: '+91 90123 45678', city: 'Bangalore', status: 'Pending', created: '2026-06-10T16:45:00Z' },
        { name: 'Gujarat Tyre Zone', phone: '+91 95432 10987', city: 'Ahmedabad', status: 'Verified', created: '2026-06-10T09:30:00Z' },
        { name: 'Srinivasa Wheels', phone: '+91 88776 65544', city: 'Hyderabad', status: 'Verified', created: '2026-06-09T14:20:00Z' }
      ],
      recentInquiries: [
        { name: 'Ramesh Kumar', email: 'ramesh@example.com', subject: 'Dealership Enquiry', message: 'Looking to purchase bulk truck tyres for logistics firm.' },
        { name: 'Siddharth Shah', email: 'sid.shah@example.com', subject: 'App issue', message: 'OTP is delayed on my registered Jio mobile number.' },
        { name: 'Manoj Tyre Hub', email: 'manojtyres@example.com', subject: 'Wholesale partnership', message: 'Interested in becoming a distributor for South region.' }
      ],
      dataSource: useMock ? 'Local/Mock Application Server' : 'Live Firebase Firestore'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, stats }));
    return;
  }
  
  // Fallback to static file server
  let filePath = '.' + urlPath;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const resolvedPath = path.resolve(filePath);
  const rootPath = path.resolve('.');
  
  if (!resolvedPath.startsWith(rootPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }
  
  // Protect admin files from direct access
  const filename = path.basename(resolvedPath);
  if ((filename === 'admin-dashboard.html' || filename === 'admin.js') && !isAdminAuthenticated(req)) {
    res.writeHead(302, { 'Location': '/admin' });
    res.end();
    return;
  }
  
  const extname = String(path.extname(resolvedPath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(resolvedPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>The page you requested was not found on this server.</p>', 'utf-8');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
});
