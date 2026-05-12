# Technical Reference Manual

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [Core Interfaces](#core-interfaces)
3. [Repository Implementation](#repository-implementation)
4. [API Server](#api-server)
5. [Console Application](#console-application)
6. [Web Interface](#web-interface)

---

## Type Definitions

### File: `src/types/user.types.ts`

This file contains all type definitions and contracts for the User entity.

#### `User` Interface

```typescript
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    createdAt: Date;
}
```

**Description**: Base interface defining the complete User object structure.

**Properties**:
- `id: string` - Unique identifier for the user
- `name: string` - User's display name
- `email: string` - User's email address
- `role: 'admin' | 'editor' | 'viewer'` - User's role (union type restricts to 3 values)
- `createdAt: Date` - Timestamp when user was created

**TypeScript Concepts**:
- **Interface**: Defines object shape, can be extended
- **Union Type**: `role` can only be one of three string literals

---

#### `AuthenticatedUser` Type

```typescript
export type AuthenticatedUser = User & { token: string };
```

**Description**: Extends User with authentication token.

**Usage**: For authenticated sessions or JWT-based auth.

**TypeScript Concepts**:
- **Intersection Type (`&`)**: Combines User with `{ token: string }`
- Result has ALL properties from User PLUS `token`

**Example**:
```typescript
const authUser: AuthenticatedUser = {
    id: '123',
    name: 'John',
    email: 'john@example.com',
    role: 'admin',
    createdAt: new Date(),
    token: 'jwt-token-here' // Additional property
};
```

---

#### `CreateUserDto` Type

```typescript
export type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
```

**Description**: Type for creating new users without server-generated fields.

**Resulting Type**:
```typescript
{
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
}
```

**TypeScript Concepts**:
- **`Omit<Type, Keys>`**: Utility type that removes specified properties
- Used when client shouldn't provide `id` or `createdAt` (server generates these)

**Usage**:
```typescript
const newUser: CreateUserDto = {
    name: 'Alice',
    email: 'alice@example.com',
    role: 'editor'
    // No id or createdAt needed
};
```

---

#### `UserSummary` Type

```typescript
export type UserSummary = Pick<User, 'id' | 'name'>;
```

**Description**: Minimal user data for list views or previews.

**Resulting Type**:
```typescript
{
    id: string;
    name: string;
}
```

**TypeScript Concepts**:
- **`Pick<Type, Keys>`**: Utility type that selects only specified properties
- Reduces payload size when full data isn't needed

**Usage**:
```typescript
const summary: UserSummary = {
    id: '123',
    name: 'Bob'
    // Only these two properties
};
```

---

#### `UpdateUserDto` Type

```typescript
export type UpdateUserDto = Partial<CreateUserDto>;
```

**Description**: Type for updating users where all fields are optional.

**Resulting Type**:
```typescript
{
    name?: string;
    email?: string;
    role?: 'admin' | 'editor' | 'viewer';
}
```

**TypeScript Concepts**:
- **`Partial<Type>`**: Makes all properties optional
- User can update just one field without providing all others

**Usage**:
```typescript
const update: UpdateUserDto = {
    role: 'admin' // Only updating role
};
```

---

#### `UserMap` Type

```typescript
export type UserMap = Record<string, User>;
```

**Description**: Dictionary/map of users indexed by ID.

**Resulting Type**:
```typescript
{
    [key: string]: User;
}
```

**TypeScript Concepts**:
- **`Record<Keys, Type>`**: Creates object type with specified key/value types
- Useful for O(1) lookups by ID

**Usage**:
```typescript
const userMap: UserMap = {
    'user-1': { id: 'user-1', name: 'Alice', ... },
    'user-2': { id: 'user-2', name: 'Bob', ... }
};
```

---

## Core Interfaces

### File: `src/core/repository.interface.ts`

#### `IRepository<T>` Interface

```typescript
export interface IRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
```

**Description**: Generic interface defining CRUD operations for any entity type.

**TypeScript Concepts**:
- **Generic Type Parameter `<T>`**: Placeholder for any type
- **Type Reusability**: Same interface works for Users, Posts, Products, etc.

**Methods**:

##### `getAll(): Promise<T[]>`

**Description**: Retrieves all entities of type T.

**Parameters**: None

**Returns**: `Promise<T[]>` - Array of all entities

**Example**:
```typescript
const users = await repo.getAll(); // Returns User[]
```

---

##### `getById(id: string): Promise<T | null>`

**Description**: Retrieves a single entity by ID.

**Parameters**:
- `id: string` - Unique identifier

**Returns**: `Promise<T | null>` - Entity if found, null otherwise

**TypeScript Concepts**:
- **Union Type (`|`)**: Return value can be T OR null

**Example**:
```typescript
const user = await repo.getById('123');
if (user) {
    console.log(user.name); // TypeScript knows user is not null here
}
```

---

##### `create(data: any): Promise<T>`

**Description**: Creates a new entity.

**Parameters**:
- `data: any` - Entity data (Note: `any` here is intentional for flexibility, but implementations should use `unknown`)

**Returns**: `Promise<T>` - Created entity with generated fields

**Example**:
```typescript
const newUser = await repo.create({
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin'
});
```

---

##### `update(id: string, data: any): Promise<T | null>`

**Description**: Updates an existing entity.

**Parameters**:
- `id: string` - Entity ID to update
- `data: any` - Fields to update (partial update supported)

**Returns**: `Promise<T | null>` - Updated entity if found, null otherwise

**Example**:
```typescript
const updated = await repo.update('123', { role: 'editor' });
```

---

##### `delete(id: string): Promise<boolean>`

**Description**: Deletes an entity.

**Parameters**:
- `id: string` - Entity ID to delete

**Returns**: `Promise<boolean>` - true if deleted, false if not found

**Example**:
```typescript
const success = await repo.delete('123');
if (success) {
    console.log('User deleted');
}
```

---

## Repository Implementation

### File: `src/features/users/user.repository.ts`

#### `UserRepository` Class

```typescript
export class UserRepository implements IRepository<User> {
    private users: User[] = [];
}
```

**Description**: Concrete implementation of IRepository for User entities.

**Properties**:
- `users: User[]` - Private in-memory array storing users

**Methods**:

---

##### `getAll(): Promise<User[]>`

```typescript
async getAll(): Promise<User[]> {
    return this.users;
}
```

**Description**: Returns all users in the system.

**Parameters**: None

**Returns**: `Promise<User[]>` - Array of all users

**Time Complexity**: O(1) - Direct array return

**Example**:
```typescript
const repo = new UserRepository();
const allUsers = await repo.getAll();
console.log(`Total users: ${allUsers.length}`);
```

---

##### `getById(id: string): Promise<User | null>`

```typescript
async getById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
}
```

**Description**: Finds a user by ID using array search.

**Parameters**:
- `id: string` - User ID to find

**Returns**: `Promise<User | null>` - Found user or null

**Implementation Details**:
- Uses `Array.find()` which returns `undefined` if not found
- Converts `undefined` to `null` with `|| null` operator

**Time Complexity**: O(n) - Linear search

**TypeScript Concepts**:
- **Type Narrowing**: The `|| null` converts `User | undefined` to `User | null`

**Example**:
```typescript
const user = await repo.getById('abc123');
if (user) {
    console.log(`Found: ${user.name}`);
} else {
    console.log('User not found');
}
```

---

##### `create(input: unknown): Promise<User>`

```typescript
async create(input: unknown): Promise<User> {
    if (typeof input === 'object' && input !== null && 'name' in input) {
        const data = input as CreateUserDto;
        const newUser: User = {
            ...data,
            id: Math.random().toString(36),
            createdAt: new Date(),
            role: data.role || 'viewer'
        };
        
        this.users.push(newUser);
        return newUser;
    }
    
    throw new Error('invalid user data');
}
```

**Description**: Creates a new user with validation and auto-generated fields.

**Parameters**:
- `input: unknown` - Untrusted input data

**Returns**: `Promise<User>` - Created user with id and createdAt

**Throws**: `Error` if input validation fails

**TypeScript Concepts**:
- **`unknown` type**: Forces explicit type checking (safer than `any`)
- **Type Narrowing**: Validates input before using it
- **`typeof` operator**: Runtime type check
- **`in` operator**: Checks if property exists
- **Type Assertion**: `as CreateUserDto` after validation
- **Spread Operator**: `...data` copies all properties

**Implementation Steps**:
1. Check if input is an object
2. Check if input is not null
3. Check if 'name' property exists
4. Assert type to CreateUserDto
5. Create User object with:
   - All properties from input (spread)
   - Generated `id` using `Math.random().toString(36)`
   - Current timestamp for `createdAt`
   - Default role to 'viewer' if not provided
6. Add to users array
7. Return created user

**Example**:
```typescript
try {
    const user = await repo.create({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin'
    });
    console.log(`Created user with ID: ${user.id}`);
} catch (error) {
    console.error('Invalid user data');
}
```

---

##### `update(id: string, input: unknown): Promise<User | null>`

```typescript
async update(id: string, input: unknown): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    if (typeof input === 'object' && input !== null) {
        const updates = input as Partial<CreateUserDto>;
        const existingUser = this.users[userIndex];
        if (!existingUser) return null;
        
        this.users[userIndex] = {
            ...existingUser,
            ...updates
        };
        return this.users[userIndex]!;
    }
    throw new Error('invalid update data');
}
```

**Description**: Updates an existing user with partial data.

**Parameters**:
- `id: string` - User ID to update
- `input: unknown` - Update data (can be partial)

**Returns**: `Promise<User | null>` - Updated user or null if not found

**Throws**: `Error` if input validation fails

**TypeScript Concepts**:
- **`Partial<T>`**: Type assertion to partial DTO
- **Spread Operator**: Merges existing user with updates
- **Non-null Assertion (`!`)**: Tells TypeScript value is definitely not null

**Implementation Steps**:
1. Find user index in array
2. Return null if not found
3. Validate input is an object
4. Assert to `Partial<CreateUserDto>` (all fields optional)
5. Get existing user
6. Merge existing user with updates (spread operator)
7. Update array
8. Return updated user

**Example**:
```typescript
const updated = await repo.update('abc123', {
    role: 'editor' // Only updating role
});

if (updated) {
    console.log(`Updated ${updated.name}'s role to ${updated.role}`);
}
```

---

##### `delete(id: string): Promise<boolean>`

```typescript
async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLength;
}
```

**Description**: Deletes a user by filtering them out of the array.

**Parameters**:
- `id: string` - User ID to delete

**Returns**: `Promise<boolean>` - true if deleted, false if not found

**Implementation Details**:
- Stores original array length
- Filters array to exclude user with matching ID
- Compares lengths to determine if deletion occurred

**Time Complexity**: O(n) - Array filter operation

**Example**:
```typescript
const deleted = await repo.delete('abc123');
if (deleted) {
    console.log('User successfully deleted');
} else {
    console.log('User not found');
}
```

---

## API Server

### File: `src/server.ts`

#### Logging System

```typescript
function log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data, null, 2) : ''}\n`;
    console.log(logMessage);
    appendFileSync(logFile, logMessage);
}
```

**Description**: Centralized logging function for debugging and monitoring.

**Parameters**:
- `message: string` - Log message text
- `data?: any` - Optional data to log (converted to JSON)

**Behavior**:
- Adds ISO timestamp to each log entry
- Writes to both console and `server.log` file
- Pretty-prints JSON data with 2-space indentation

**Usage**:
```typescript
log('User created', { userId: '123', name: 'Alice' });
log('Server starting');
log('Error occurred', error);
```

---

#### Express Application Setup

```typescript
const app = express();
const repo = new UserRepository();
const PORT = 3000;

app.use((req, res, next) => {
    log(`Incoming ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));
```

**Description**: Initializes Express server with middleware and logging.

**Components**:
- `express()` - Creates Express application
- `new UserRepository()` - Creates repository instance
- Logging middleware - Logs all incoming requests
- `express.json()` - Parses JSON request bodies
- `express.static()` - Serves static files from public folder

---

#### API Endpoints

##### `GET /api/users`

```typescript
app.get('/api/users', async (req, res) => {
    try {
        const users = await repo.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
```

**Description**: Retrieves all users.

**Method**: GET

**Parameters**: None

**Response**:
- **Success (200)**: Array of User objects
- **Error (500)**: `{ error: string }`

**Example Request**:
```http
GET /api/users HTTP/1.1
```

**Example Response**:
```json
[
    {
        "id": "abc123",
        "name": "Alice",
        "email": "alice@example.com",
        "role": "admin",
        "createdAt": "2026-05-12T10:00:00.000Z"
    }
]
```

---

##### `GET /api/users/:id`

```typescript
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
```

**Description**: Retrieves a single user by ID.

**Method**: GET

**Parameters**:
- `id` (URL parameter) - User ID

**Response**:
- **Success (200)**: User object
- **Not Found (404)**: `{ error: 'User not found' }`
- **Error (500)**: `{ error: string }`

**Example Request**:
```http
GET /api/users/abc123 HTTP/1.1
```

---

##### `POST /api/users`

```typescript
app.post('/api/users', async (req, res) => {
    try {
        const userData: CreateUserDto = req.body;
        const newUser = await repo.create(userData);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Invalid user data' });
    }
});
```

**Description**: Creates a new user.

**Method**: POST

**Request Body**: CreateUserDto
```json
{
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
}
```

**Response**:
- **Success (201)**: Created User object with id and createdAt
- **Error (400)**: `{ error: 'Invalid user data' }`

**Example Request**:
```http
POST /api/users HTTP/1.1
Content-Type: application/json

{
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
}
```

---

##### `PUT /api/users/:id`

```typescript
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
```

**Description**: Updates an existing user.

**Method**: PUT

**Parameters**:
- `id` (URL parameter) - User ID to update

**Request Body**: UpdateUserDto (partial)
```json
{
    "role": "editor"
}
```

**Response**:
- **Success (200)**: Updated User object
- **Not Found (404)**: `{ error: 'User not found' }`
- **Error (400)**: `{ error: 'Invalid user data' }`

---

##### `DELETE /api/users/:id`

```typescript
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
```

**Description**: Deletes a user.

**Method**: DELETE

**Parameters**:
- `id` (URL parameter) - User ID to delete

**Response**:
- **Success (204)**: No content
- **Not Found (404)**: `{ error: 'User not found' }`
- **Error (500)**: `{ error: 'Failed to delete user' }`

---

## Console Application

### File: `src/app.ts`

#### `handleUserRole(user: User): string`

```typescript
async function handleUserRole(user: User) {
    if (user.createdAt instanceof Date) {
        console.log(`User joined on ${user.createdAt.toLocaleDateString()}`);
    }

    switch (user.role) {
        case 'admin':
            return "Full access";
        case 'editor':
            return "Edit access";
        case 'viewer':
            return "Read access";
        default:
            const _exhaustiveCheck: never = user.role;
            return _exhaustiveCheck;
    }
}
```

**Description**: Determines access level based on user role and demonstrates exhaustive type checking.

**Parameters**:
- `user: User` - User object

**Returns**: `string` - Access level description

**TypeScript Concepts**:
- **`instanceof` operator**: Checks if value is instance of Date class
- **`never` type**: Forces exhaustive handling of all union type values
- **Exhaustive Checking**: If a new role is added to the union type but not handled in the switch, TypeScript will error

**How Exhaustive Checking Works**:
```typescript
// If User.role is 'admin' | 'editor' | 'viewer' | 'super-admin'
// but we only handle first 3 cases:
default:
    const _exhaustiveCheck: never = user.role;
    // ERROR: Type 'super-admin' is not assignable to type 'never'
```

---

#### `main(): void`

```typescript
async function main() {
    // Demo function that:
    // 1. Creates multiple users
    // 2. Reads all users
    // 3. Reads user by ID
    // 4. Demonstrates role handling
    // 5. Tests invalid input
}
```

**Description**: Main demo function showcasing all CRUD operations and TypeScript concepts.

**Operations Demonstrated**:
1. CREATE multiple users with different roles
2. READ all users from repository
3. READ single user by ID
4. Type narrowing with invalid input
5. Role-based access control

---

## Web Interface

### File: `public/index.html`

#### JavaScript Functions

##### `fetchUsers(): void`

```javascript
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        showError('Failed to load users');
    }
}
```

**Description**: Fetches all users from API and displays them.

**Parameters**: None

**Side Effects**: Updates DOM with user list

---

##### `displayUsers(users: User[]): void`

```javascript
function displayUsers(users) {
    const usersList = document.getElementById('users-list');
    const userCount = document.getElementById('user-count');
    
    userCount.textContent = users.length;

    if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">No users yet...</div>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-name">${escapeHtml(user.name)}</div>
            <div class="user-email">📧 ${escapeHtml(user.email)}</div>
            <span class="user-role role-${user.role}">${user.role}</span>
            <div class="user-date">Created: ${new Date(user.createdAt).toLocaleDateString()}</div>
            <div class="user-actions">
                <button class="btn-edit" onclick="editUser('${user.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteUser('${user.id}', '${escapeHtml(user.name)}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}
```

**Description**: Renders user list in DOM.

**Parameters**:
- `users: User[]` - Array of users to display

**Side Effects**: Updates user list container and count

---

##### `escapeHtml(text: string): string`

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

**Description**: Sanitizes HTML to prevent XSS attacks.

**Parameters**:
- `text: string` - Text to sanitize

**Returns**: `string` - HTML-safe text

**Security**: Prevents injection attacks

---

##### `editUser(userId: string): void`

```javascript
async function editUser(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`);
        const user = await response.json();
        
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-role').value = user.role;
        
        document.getElementById('edit-modal').classList.add('active');
    } catch (error) {
        showError('Failed to load user details');
    }
}
```

**Description**: Loads user data and opens edit modal.

**Parameters**:
- `userId: string` - ID of user to edit

**Side Effects**: Populates form and displays modal

---

##### `deleteUser(userId: string, userName: string): void`

```javascript
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete user');

        fetchUsers();
    } catch (error) {
        showError('Failed to delete user. Please try again.');
    }
}
```

**Description**: Deletes user after confirmation.

**Parameters**:
- `userId: string` - ID of user to delete
- `userName: string` - Name for confirmation message

**Side Effects**: Removes user and refreshes list

---

##### `showError(message: string): void`

```javascript
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
    setTimeout(() => errorDiv.innerHTML = '', 3000);
}
```

**Description**: Displays error message for 3 seconds.

**Parameters**:
- `message: string` - Error message to display

**Side Effects**: Temporarily updates error container

---

##### `closeEditModal(): void`

```javascript
function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
    document.getElementById('edit-user-form').reset();
}
```

**Description**: Closes edit modal and resets form.

**Parameters**: None

**Side Effects**: Hides modal and clears form fields

---

## TypeScript Concepts Summary

### Type Narrowing Techniques Used

1. **`typeof` operator** - Primitive type checks
2. **`instanceof` operator** - Class instance checks
3. **`in` operator** - Property existence checks
4. **Type Guards** - Functions that narrow types
5. **Truthiness checks** - `if (value)` narrows from `T | null`

### Type Safety Patterns

1. **`unknown` over `any`** - Forces explicit type checking
2. **Union types** - Restricts values to specific options
3. **`never` type** - Exhaustive switch statements
4. **Non-null assertions (`!`)** - When you know value exists
5. **Type assertions (`as`)** - After validation

### Generic Patterns

1. **Generic Interfaces** - `IRepository<T>` works for any type
2. **Generic Constraints** - Can add `<T extends BaseType>`
3. **Type Parameters** - Functions can be generic too

---

This manual covers every function, type, and concept used in the codebase with practical examples and explanations.
