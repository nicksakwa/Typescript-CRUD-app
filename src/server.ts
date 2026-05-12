import express from 'express';
import { UserRepository } from './features/users/index.js';
import type { CreateUserDto } from './features/users/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, appendFileSync, existsSync } from 'fs';

const logFile = 'server.log';
if (!existsSync(logFile)) {
    writeFileSync(logFile, '=== Server Log Started ===\n');
}

function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;
    console.log(logMessage);
    appendFileSync(logFile, logMessage);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const repo = new UserRepository();
const PORT = 3000;

log('Server initializing...');

app.use((req, res, next) => {
    log(`Incoming ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

app.get('/api/users', async (req, res) => {
    try {
        log('GET /api/users - Fetching all users');
        const users = await repo.getAll();
        log('GET /api/users - Success', { count: users.length });
        res.json(users);
    } catch (error) {
        log('GET /api/users - Error', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        log('GET /api/users/:id', { id: req.params.id });
        const user = await repo.getById(req.params.id);
        if (!user) {
            log('GET /api/users/:id - User not found', { id: req.params.id });
            return res.status(404).json({ error: 'User not found' });
        }
        log('GET /api/users/:id - Success', { user });
        res.json(user);
    } catch (error) {
        log('GET /api/users/:id - Error', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        log('POST /api/users', { body: req.body });
        const userData: CreateUserDto = req.body;
        const newUser = await repo.create(userData);
        log('POST /api/users - Success', { user: newUser });
        res.status(201).json(newUser);
    } catch (error) {
        log('POST /api/users - Error', error);
        res.status(400).json({ error: 'Invalid user data' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        log('PUT /api/users/:id', { id: req.params.id, body: req.body });
        const updatedUser = await repo.update(req.params.id, req.body);
        if (!updatedUser) {
            log('PUT /api/users/:id - User not found', { id: req.params.id });
            return res.status(404).json({ error: 'User not found' });
        }
        log('PUT /api/users/:id - Success', { user: updatedUser });
        res.json(updatedUser);
    } catch (error) {
        log('PUT /api/users/:id - Error', error);
        res.status(400).json({ error: 'Invalid user data' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        log('DELETE /api/users/:id', { id: req.params.id });
        const deleted = await repo.delete(req.params.id);
        if (!deleted) {
            log('DELETE /api/users/:id - User not found', { id: req.params.id });
            return res.status(404).json({ error: 'User not found' });
        }
        log('DELETE /api/users/:id - Success');
        res.status(204).send();
    } catch (error) {
        log('DELETE /api/users/:id - Error', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.listen(PORT, () => {
    log(`🚀 Server running at http://localhost:${PORT}`);
    log(`📝 Open your browser to view the User Management interface`);
    log(`📋 Check server.log file for detailed logs`);
});
