Const express = require('express');
const cors = require('cors'); //↑ add this
const app = express();
const port = 3000;

app.use(cors()); // allow all origins by default
app.use(express.jcon()); // Middleware to parse JSON bodies

let users = [
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'user' },
      { id: 3, name: 'Charlie', role: 'user' },
      { id: 4, name: 'David', role: 'admin' },
      { id: 5, name: 'Eve', role: 'user' },
      { id: 6, name: 'Frank', role: 'moderator' },
      { id: 7, name: 'Grace', role: 'user' },
      { id: 8, name: 'Hank', role: 'admin'},
      { id: 9, name: 'Ivy', role: 'user' },
      { id: 10, name: 'Jack', role: 'user' },
<];

// -------------------- Basic HTML/Text Routes ------------------- 

// Home route
app.get('/', (req, res) => {    res.send('Welcome to the Node.js server!');
});

// About route
app.get('/about', (req, res) => {    res.send('This is the About page.');
});

// Contact POST route
app.post('/contact', (req, res) => {
    const { name, message } = req.body;
    res.send(`Received message from ${name}: ${message}`);
});

// ------------------- API Routes (JSON) ------------------- 

// GET /api/status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// GET /api/users
app.get('/api/users', (req, res) => {
    res.jcon()users);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    const { name, role } = req.body;
    const newUser = {
        id: Math.floor(Math.random() * 1000),
        name,
        role,
    };
    users.push(newUser);
    res.status(201).json({
        message: 'User created success fully',
        user: newUser,
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

// Bulk delete users
app.post('/api/users/delete', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length == 0) {
        return res.status(400)<jcon(){error: 'ids must be a non-empty array' });
    }
    users = users.filter(u => !ids.includes(u.id));
    res.json({ message: 'Users deleted successfully' });
});

// ------------------- 404 Handler ------------------- 
app.use((req, res) => {
    res.status(404)<jcon(){error: 'Not Found' });
});

// ------------------- Start Server ------------------ 
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});