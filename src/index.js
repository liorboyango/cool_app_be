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

// Function to validate phone number (E.164 format)
function isValidPhoneNumber(phone) {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

// Function to validate name
function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 50) return false;
  // XSS check for HTML tags
  if (/<[^>]*>/i.test(trimmed)) return false;
  return true;
}

// Function to validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate LinkedIn URL
function isValidLinkedInUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return true; // Allow empty
  try {
    const parsedUrl = new URL(trimmed);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return false;
    }
    // Check if it's a LinkedIn domain
    const hostname = parsedUrl.hostname.toLowerCase();
    if (!hostname.includes('linkedin.com')) {
      return false;
    }
    // Max length 512 chars
    if (trimmed.length > 512) {
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
    {id: 1, firstName: 'Alice', lastName: 'Smith', role: 'admin', email: 'alice@example.com', gender: 'female', phoneNumber: '+1234567890', linkedinUrl: 'https://www.linkedin.com/in/alice-smith'},
    {id: 2, firstName: 'Bob', lastName: 'Johnson', role: 'user', email: 'bob@example.com', gender: 'male', phoneNumber: '+1987654321', linkedinUrl: 'https://www.linkedin.com/in/bob-johnson'},
    {id: 3, firstName: 'Charlie', lastName: 'Brown', role: 'user', email: 'charlie@example.com', gender: 'male'},
    {id: 4, firstName: 'David', lastName: 'Williams', role: 'admin', email: 'david@example.com', gender: 'male', phoneNumber: '+1555123456', linkedinUrl: 'https://www.linkedin.com/in/david-williams'},
    {id: 5, firstName: 'Eve', lastName: 'Davis', role: 'user', email: 'eve@example.com', gender: 'female'},
    {id: 6, firstName: 'Frank', lastName: 'Miller', role: 'moderator', email: 'frank@example.com', gender: 'male', phoneNumber: '+1444987654'},
    {id: 7, firstName: 'Grace', lastName: 'Garcia', role: 'user', email: 'grace@example.com', gender: 'female', phoneNumber: '+1777888999', linkedinUrl: 'https://www.linkedin.com/in/grace-garcia'},
    {id: 8, firstName: 'Hank', lastName: 'Martinez', role: 'admin', email: 'hank@example.com', gender: 'male'},
    {id: 9, firstName: 'Ivy', lastName: 'Lopez', role: 'user', email: 'ivy@example.com', gender: 'female', phoneNumber: '+1888123456'},
    {id: 10, firstName: 'Jack', lastName: 'Gonzalez', role: 'user', email: 'jack@example.com', gender: 'male', phoneNumber: '+1999765432'},
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
    const { sort, gender } = req.query;
    let filteredUsers = [...users];
    if (gender && gender !== 'all') {
        filteredUsers = filteredUsers.filter(u => u.gender === gender);
    }
    if (sort) {
        const [field, order] = sort.split(':');
        if (field === 'firstName' && (order === 'asc' || order === 'desc')) {
            filteredUsers.sort((a, b) => order === 'asc' ? a.firstName.localeCompare(b.firstName) : b.firstName.localeCompare(a.firstName));
        } else if (field === 'lastName' && (order === 'asc' || order === 'desc')) {
            filteredUsers.sort((a, b) => order === 'asc' ? a.lastName.localeCompare(b.lastName) : b.lastName.localeCompare(a.lastName));
        } else if (field === 'fullName' && (order === 'asc' || order === 'desc')) {
            filteredUsers.sort((a, b) => {
                const fullA = `${a.firstName} ${a.lastName}`;
                const fullB = `${b.firstName} ${b.lastName}`;
                return order === 'asc' ? fullA.localeCompare(fullB) : fullB.localeCompare(fullA);
            });
        }
    }
    res.json(filteredUsers);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    const {firstName, lastName, role, email, gender, phoneNumber, linkedinUrl} = req.body;
    if (!isValidName(firstName) || !isValidName(lastName)) {
        return res.status(400).json({error: 'Invalid first or last name'});
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({error: 'Invalid email format'});
    }
    if (!gender || !['male', 'female'].includes(gender)) {
        return res.status(400).json({error: 'Invalid gender'});
    }
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({error: 'Invalid phone number format (E.164)'});
    }
    if (linkedinUrl && !isValidLinkedInUrl(linkedinUrl)) {
        return res.status(400).json({error: 'Invalid LinkedIn URL'});
    }
    const newUser = {
        id: Math.floor(Math.random() * 1000),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        email,
        gender,
        phoneNumber: phoneNumber || null,
        linkedinUrl: linkedinUrl?.trim() || null,
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
    const {firstName, lastName, role, email, gender, phoneNumber, linkedinUrl} = req.body;
    if (firstName !== undefined && !isValidName(firstName)) {
        return res.status(400).json({error: 'Invalid first name'});
    }
    if (lastName !== undefined && !isValidName(lastName)) {
        return res.status(400).json({error: 'Invalid last name'});
    }
    if (email !== undefined && !isValidEmail(email)) {
        return res.status(400).json({error: 'Invalid email format'});
    }
    if (gender && !['male', 'female'].includes(gender)) {
        return res.status(400).json({error: 'Invalid gender'});
    }
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({error: 'Invalid phone number format (E.164)'});
    }
    if (linkedinUrl !== undefined && linkedinUrl && !isValidLinkedInUrl(linkedinUrl)) {
        return res.status(400).json({error: 'Invalid LinkedIn URL'});
    }
    if (firstName !== undefined) users[index].firstName = firstName.trim();
    if (lastName !== undefined) users[index].lastName = lastName.trim();
    if (role !== undefined) users[index].role = role;
    if (email !== undefined) users[index].email = email;
    if (gender !== undefined) users[index].gender = gender;
    if (phoneNumber !== undefined) users[index].phoneNumber = phoneNumber;
    if (linkedinUrl !== undefined) users[index].linkedinUrl = linkedinUrl?.trim() || null;
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