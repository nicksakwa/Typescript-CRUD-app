import express from 'express';
import { UserRepository } from './features/users/index.js';
import type { CreateUserDto } from './features/users/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const repo = new UserRepository();
const PORT = 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

app.get('/api/users', async (req, res) => {
    try {
        const users = await repo.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await repo.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const userData: CreateUserDto = req.body;
        const newUser = await repo.create(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Invalid user data' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await repo.update(req.params.id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: 'Invalid user data' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deleted = await repo.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📝 Open your browser to view the User Management interface`);
});
