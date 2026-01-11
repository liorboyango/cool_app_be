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
    {id: 1, name: 'Alice', role: 'moderator', email: 'alice@example.com', location: 'City 1', tags: ['moderator']},
    {id: 2, name: 'Bob', role: 'editor', email: 'bob@example.com', location: 'City 2', tags: ['editor']},
    {id: 3, name: 'Charlie', role: 'voter', email: 'charlie@example.com', location: 'City 3', tags: ['voter']},
    {id: 4, name: 'David', role: 'moderator', email: 'david@example.com', location: 'City 4', tags: ['moderator']},
    {id: 5, name: 'Eve', role: 'editor', email: 'eve@example.com', location: 'City 5', tags: ['editor']},
    {id: 6, name: 'Frank', role: 'voter', email: 'frank@example.com', location: 'City 6', tags: ['voter']},
    {id: 7, name: 'Grace', role: 'moderator', email: 'grace@example.com', location: 'City 7', tags: ['moderator']},
    {id: 8, name: 'Hank', role: 'editor', email: 'hank@example.com', location: 'City 8', tags: ['editor']},
    {id: 9, name: 'Ivy', role: 'voter', email: 'ivy@example.com', location: 'City 9', tags: ['voter']},
    {id: 10, name: 'Jack', role: 'moderator', email: 'jack@example.com', location: 'City 10', tags: ['moderator']},
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
        location: 'New City',
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
    users[index].tags = [users[index].role]; // update tags
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