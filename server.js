const tls = require('tls');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const express = require('express');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Initialize data file
function initializeDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const defaultData = {
        websites: [],
        lastChecked: null,
        lastUpdated: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      console.log('✅ Data file created');
    }
  } catch (error) {
    console.error('❌ Error creating data file:', error.message);
  }
}

// Read data
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      initializeDataFile();
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️ Error reading data file:', error.message);
    return { websites: [], lastChecked: null, lastUpdated: new Date().toISOString() };
  }
}

// Write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('⚠️ Error writing data file:', error.message);
  }
}

// Get SSL certificate expiry
async function getSSLExpiryDate(domain) {
  return new Promise((resolve) => {
    try {
      domain = domain
        .replace('https://', '')
        .replace('http://', '')
        .split('/')[0]
        .trim();

      const options = {
        host: domain,
        port: 443,
        rejectUnauthorized: false
      };

      let timeoutHandle = setTimeout(() => {
        req.destroy();
      }, 10000);

      const req = tls.connect(options, function() {
        clearTimeout(timeoutHandle);
        try {
          const cert = req.getPeerCertificate();
          req.destroy();

          if (!cert || !cert.valid_to) {
            resolve({
              domain,
              expiryDate: null,
              daysUntilExpiry: null,
              status: 'Error: No certificate found',
              lastChecked: new Date().toISOString()
            });
            return;
          }

          const expiryDate = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

          let status = 'Valid';
          if (daysUntilExpiry < 0) {
            status = 'Expired';
          } else if (daysUntilExpiry < 7) {
            status = 'Critical';
          } else if (daysUntilExpiry < 30) {
            status = 'Warning';
          }

          resolve({
            domain,
            expiryDate: expiryDate.toISOString().split('T')[0],
            daysUntilExpiry,
            status,
            lastChecked: new Date().toISOString()
          });
        } catch (error) {
          req.destroy();
          resolve({
            domain,
            expiryDate: null,
            daysUntilExpiry: null,
            status: 'Error: ' + error.message.substring(0, 40),
            lastChecked: new Date().toISOString()
          });
        }
      });

      req.on('error', (error) => {
        clearTimeout(timeoutHandle);
        req.destroy();
        resolve({
          domain,
          expiryDate: null,
          daysUntilExpiry: null,
          status: `Error: ${error.message.substring(0, 50)}`,
          lastChecked: new Date().toISOString()
        });
      });
    } catch (error) {
      resolve({
        domain,
        expiryDate: null,
        daysUntilExpiry: null,
        status: `Error: ${error.message.substring(0, 50)}`,
        lastChecked: new Date().toISOString()
      });
    }
  });
}

// Check all SSL certificates
async function checkAllSSLCertificates() {
  console.log('🔍 Starting SSL certificate check...');
  const data = readData();

  for (let i = 0; i < data.websites.length; i++) {
    const website = data.websites[i];
    const result = await getSSLExpiryDate(website.url);
    
    data.websites[i] = {
      url: website.url,
      ...result
    };

    console.log(`✓ Checked: ${website.url}`);
  }

  data.lastChecked = new Date().toISOString();
  data.lastUpdated = new Date().toISOString();
  writeData(data);
  console.log('✅ SSL certificate check completed');
}

// API Routes

// Get all websites
app.get('/api/websites', (req, res) => {
  const data = readData();
  res.json(data);
});

// Add website
app.post('/api/websites', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const data = readData();

    // Check if already exists
    if (data.websites.some(w => w.url === url)) {
      return res.status(400).json({ error: 'Website already exists' });
    }

    data.websites.push({
      url,
      expiryDate: null,
      daysUntilExpiry: null,
      status: 'Pending',
      lastChecked: null
    });

    data.lastUpdated = new Date().toISOString();
    writeData(data);

    // Check SSL immediately
    getSSLExpiryDate(url).then(result => {
      const data = readData();
      const index = data.websites.findIndex(w => w.url === url);
      if (index !== -1) {
        data.websites[index] = { url, ...result };
        data.lastUpdated = new Date().toISOString();
        writeData(data);
      }
    }).catch(err => console.error('Error checking SSL:', err));

    res.json({ success: true, message: 'Website added' });
  } catch (error) {
    console.error('Error in POST /api/websites:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete website
app.delete('/api/websites/:index', (req, res) => {
  const { index } = req.params;
  const data = readData();

  if (index < 0 || index >= data.websites.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  data.websites.splice(index, 1);
  data.lastUpdated = new Date().toISOString();
  writeData(data);

  res.json({ success: true, message: 'Website deleted' });
});

// Check single website
app.post('/api/check/:index', async (req, res) => {
  const { index } = req.params;
  const data = readData();

  if (index < 0 || index >= data.websites.length) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  const url = data.websites[index].url;
  const result = await getSSLExpiryDate(url);

  data.websites[index] = { url, ...result };
  data.lastUpdated = new Date().toISOString();
  writeData(data);

  res.json(result);
});

// Check all websites
app.post('/api/check-all', async (req, res) => {
  await checkAllSSLCertificates();
  const data = readData();
  res.json({ success: true, data });
});

// Initialize data file
initializeDataFile();

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n');
  console.log('╔════════════════════════════════════╗');
  console.log('║   SSL Certificate Dashboard        ║');
  console.log('╠════════════════════════════════════╣');
  console.log(`║ 🚀 Server running on port ${PORT}         ║`);
  console.log('║ 🌐 http://localhost:3000           ║');
  console.log('║ 📊 http://127.0.0.1:3000           ║');
  console.log('╠════════════════════════════════════╣');
  console.log('║ Press Ctrl+C to stop               ║');
  console.log('╚════════════════════════════════════╝');
  console.log('\n');

  // Schedule daily check at 9:00 AM
  schedule.scheduleJob('0 9 * * *', () => {
    console.log('⏰ Running scheduled SSL check...');
    checkAllSSLCertificates();
  });

  console.log('📅 Scheduled daily check at 9:00 AM\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('   Kill other processes using this port.');
  } else {
    console.error('❌ Server error:', error.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📛 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

// Catch unhandled errors
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});
