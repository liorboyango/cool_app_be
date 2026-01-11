const express = require('express');
const cors = require('cors'); // ✅ add this
const app = express();
const port = process.env.PORT || 3000;

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

let users = [
    {id: 1, name: 'Alice', role: 'Editors', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/56/56?random=1', location: 'New York', tags: ['Editor']},
    {id: 2, name: 'Bob', role: 'Reputation', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/56/56?random=2', location: 'Los Angeles', tags: ['User']},
    {id: 3, name: 'Charlie', role: 'Voters', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/56/56?random=3', location: 'Chicago', tags: ['Voter']},
    {id: 4, name: 'David', role: 'Moderators', email: 'david@example.com', avatarUrl: 'https://picsum.photos/56/56?random=4', location: 'Houston', tags: ['Moderator']},
    {id: 5, name: 'Eve', role: 'Reputation', email: 'eve@example.com', avatarUrl: 'https://picsum.photos/56/56?random=5', location: 'Phoenix', tags: ['User']},
    {id: 6, name: 'Frank', role: 'Editors', email: 'frank@example.com', avatarUrl: 'https://picsum.photos/56/56?random=6', location: 'Philadelphia', tags: ['Editor']},
    {id: 7, name: 'Grace', role: 'Voters', email: 'grace@example.com', avatarUrl: 'https://picsum.photos/56/56?random=7', location: 'San Antonio', tags: ['Voter']},
    {id: 8, name: 'Hank', role: 'Moderators', email: 'hank@example.com', avatarUrl: 'https://picsum.photos/56/56?random=8', location: 'San Diego', tags: ['Moderator']},
    {id: 9, name: 'Ivy', role: 'Reputation', email: 'ivy@example.com', avatarUrl: 'https://picsum.photos/56/56?random=9', location: 'Dallas', tags: ['User']},
    {id: 10, name: 'Jack', role: 'Editors', email: 'jack@example.com', avatarUrl: 'https://picsum.photos/56/56?random=10', location: 'San Jose', tags: ['Editor']},
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
        avatarUrl: `https://picsum.photos/56/56?random=${Math.floor(Math.random() * 1000)}`,
        location: 'Unknown',
        tags: [role],
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
