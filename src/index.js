const express = require('express');
const cors = require('cors'); // ✅ add this
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const https = require('https');
const app = express();
const port = process.env.PORT || 3000;

// Enable Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Enable CORS
const allowedOrigins = [
    'https://liorboyango.github.io',          // Your project site
    'http://localhost:3000'                     // For local Flutter web dev
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },              // ← use * for development;
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Middleware to parse JSON bodies

// Rate limiter for proxy endpoint
const proxyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Function to validate image URL
function isValidImageUrl(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    // Allow specific domains (e.g., gravatar, pravatar)
    const allowedHosts = ['i.pravatar.cc', 'www.gravatar.com', 'secure.gravatar.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return false;
    }
    // Max length 512 chars
    if (url.length > 512) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Proxy endpoint for images
app.get('/proxy/image', proxyLimiter, async (req, res) => {
  const { url } = req.query;
  if (!url || !isValidImageUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }
  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 5000,
      httpsAgent: new https.Agent({ rejectUnauthorized: true }),
      maxContentLength: 2 * 1024 * 1024, // 2MB limit
    });
    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Length': response.headers['content-length'],
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Type-Options': 'nosniff',
    });
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});

let users = [
    {id: 1, name: 'Alice', role: 'admin', email: 'alice@example.com'},
    {id: 2, name: 'Bob', role: 'user', email: 'bob@example.com'},
    {id: 3, name: 'Charlie', role: 'user', email: 'charlie@example.com'},
    {id: 4, name: 'David', role: 'admin', email: 'david@example.com'},
    {id: 5, name: 'Eve', role: 'user', email: 'eve@example.com'},
    {id: 6, name: 'Frank', role: 'moderator', email: 'frank@example.com'},
    {id: 7, name: 'Grace', role: 'user', email: 'grace@example.com'},
    {id: 8, name: 'Hank', role: 'admin', email: 'hank@example.com'},
    {id: 9, name: 'Ivy', role: 'user', email: 'ivy@example.com'},
    {id: 10, name: 'Jack', role: 'user', email: 'jack@example.com'},
];

// -------------------- Basic HTML/Text Routes --------------------

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js server!');
});

// About route
app.get('/about', (req, res) => {
    res.send('This is the About page.');
});

// Contact POST route
app.post('/contact', (req, res) => {
    const {name, message} = req.body;
    res.send(`Received message from ${name}: ${message}`);
});

// -------------------- API Routes (JSON) --------------------

// GET /api/status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// GET /api/users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    const {name, role, email} = req.body;
    const newUser = {
        id: Math.floor(Math.random() * 1000),
        name,
        role,
        email,
    };
    users.push(newUser);
    res.status(201).json({
        message: 'User created successfully',
        user: newUser,
    });
});

// PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        return res.status(404).json({error: 'User not found'});
    }
    const {name, role, email} = req.body;
    if (name !== undefined) users[index].name = name;
    if (role !== undefined) users[index].role = role;
    if (email !== undefined) users[index].email = email;
    res.json({
        message: 'User updated successfully',
        user: users[index],
    });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users.splice(index, 1);
        res.json({message: 'User deleted'});
    } else {
        res.status(404).json({error: 'User not found'});
    }
});

// DELETE /api/users (bulk)
app.delete('/api/users', (req, res) => {
    const {ids} = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({error: 'ids must be an array'});
    }
    const initialLength = users.length;
    users = users.filter(u => !ids.includes(u.id));
    const deletedCount = initialLength - users.length;
    res.json({message: `Deleted ${deletedCount} users`});
});

// -------------------- 404 Handler --------------------
app.use((req, res) => {
    res.status(404).json({error: 'Not Found'});
});

// -------------------- Start Server --------------------
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});