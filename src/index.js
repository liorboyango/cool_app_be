const express = require('express');
const cors = require('cors'); // ✅ add this
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const app = express();
const port = process.env.PORT || 3000;

// Cache for images
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

// Rate limiter for proxy
const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

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

// Apply rate limiter to proxy route
app.use('/api/proxy', proxyLimiter);

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

// GET /api/proxy?url=<base64_encoded_url>
app.get('/api/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  try {
    const decodedUrl = Buffer.from(url, 'base64').toString('utf-8');
    // Validate URL
    const urlObj = new URL(decodedUrl);
    const allowedDomains = ['i.pravatar.cc'];
    if (!allowedDomains.includes(urlObj.hostname) || urlObj.protocol !== 'https:') {
      return res.status(403).json({ error: 'Domain not allowed or not HTTPS' });
    }
    // Check cache
    const cached = cache.get(decodedUrl);
    if (cached) {
      res.set({
        'Content-Type': cached.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      });
      return res.send(Buffer.from(cached.data));
    }
    // Fetch the image
    const response = await axios.get(decodedUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
    });
    // Cache the response
    cache.set(decodedUrl, {
      data: response.data,
      contentType: response.headers['content-type'],
    });
    // Set headers
    res.set({
      'Content-Type': response.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    });
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// -------------------- 404 Handler --------------------
app.use((req, res) => {
    res.status(404).json({error: 'Not Found'});
});

// -------------------- Start Server --------------------
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
