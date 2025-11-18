const express = require('express');
const cors = require('cors'); // ✅ add this
const app = express();
const port = 3000;

app.use(cors()); // allow all origins by default
app.use(express.json()); // Middleware to parse JSON bodies

let users = [
        { id: 1, name: 'Alice', role: 'admin', email: 'alice@example.com' },
        { id: 2, name: 'Bob', role: 'user', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', role: 'user', email: 'charlie@example.com' },
        { id: 4, name: 'David', role: 'admin', email: 'david@example.com' },
        { id: 5, name: 'Eve', role: 'user', email: 'eve@example.com' },
        { id: 6, name: 'Frank', role: 'moderator', email: 'frank@example.com' },
        { id: 7, name: 'Grace', role: 'user', email: 'grace@example.com' },
        { id: 8, name: 'Hank', role: 'admin', email: 'hank@example.com' },
        { id: 9, name: 'Ivy', role: 'user', email: 'ivy@example.com' },
        { id: 10, name: 'Jack', role: 'user', email: 'jack@example.com' },
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
    const { name, message } = req.body;
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
    const { name, role, email } = req.body;
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
        return res.status(404).json({ error: 'User not found' });
    }
    const { name, role, email } = req.body;
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
        res.json({ message: 'User deleted' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// DELETE /api/users (bulk)
app.delete('/api/users', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array' });
    }
    const initialLength = users.length;
    users = users.filter(u => !ids.includes(u.id));
    const deletedCount = initialLength - users.length;
    res.json({ message: `Deleted ${deletedCount} users` });
});

// -------------------- 404 Handler -------------------- 
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// -------------------- Start Server -------------------- 
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});