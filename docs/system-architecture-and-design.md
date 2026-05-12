# System Architecture & Design

## Overview

The TypeScript CRUD Application follows a **layered architecture** with clear separation of concerns, implementing clean code principles and SOLID design patterns. The system is designed to demonstrate TypeScript's advanced features while maintaining production-ready code quality.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌─────────────────────┐      ┌─────────────────────────┐  │
│  │   Console Demo      │      │    Web Interface        │  │
│  │    (app.ts)         │      │   (index.html + CSS)    │  │
│  └─────────────────────┘      └─────────────────────────┘  │
└───────────────────────┬───────────────────┬─────────────────┘
                        │                   │
                        ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                  ┌──────────────┐                            │
│                  │  Express API │                            │
│                  │  (server.ts) │                            │
│                  └──────────────┘                            │
│                         │                                    │
│     GET/POST/PUT/DELETE /api/users                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│               ┌───────────────────────────┐                 │
│               │   Public API (index.ts)   │                 │
│               │    (Barrel Export)        │                 │
│               └─────────────┬─────────────┘                 │
│                             │                                │
│                             ▼                                │
│               ┌───────────────────────────┐                 │
│               │   UserRepository          │                 │
│               │  (user.repository.ts)     │                 │
│               │   implements IRepository  │                 │
│               └─────────────┬─────────────┘                 │
└─────────────────────────────┼─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Core Layer (Abstractions)                  │
│               ┌───────────────────────────┐                 │
│               │  IRepository<T> Interface │                 │
│               │ (repository.interface.ts) │                 │
│               └───────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Type Definitions Layer                    │
│               ┌───────────────────────────┐                 │
│               │   User Type Contracts     │                 │
│               │    (user.types.ts)        │                 │
│               │  - Interfaces             │                 │
│               │  - Type Aliases           │                 │
│               │  - Utility Types          │                 │
│               └───────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Dependency Inversion Principle (DIP)

**Concept**: High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Implementation**:
- `IRepository<T>` interface defines the contract
- `UserRepository` implements the interface
- Application code depends on `IRepository<T>`, not concrete implementations
- Easy to swap implementations (e.g., PostgreSQL, MongoDB) without changing business logic

```typescript
// Core abstraction
export interface IRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}

// Concrete implementation
export class UserRepository implements IRepository<User> {
    // Implementation details...
}
```

### 2. High Cohesion

**Concept**: Related functionality should be grouped together in the same module.

**Implementation**:
- All User-related data operations are in `UserRepository`
- Type definitions are centralized in `user.types.ts`
- Each module has a single, well-defined responsibility

### 3. Loose Coupling

**Concept**: Modules should be independent and minimally dependent on other modules.

**Implementation**:
- **Barrel Exports** (`index.ts`) provide controlled public APIs
- Internal implementation details are hidden
- Modules communicate through interfaces, not concrete implementations
- Changes to internal structure don't affect consumers

### 4. Single Responsibility Principle (SRP)

Each file/class has one reason to change:
- `user.types.ts` - Type definitions change only when User structure changes
- `user.repository.ts` - Data operations change only when storage logic changes
- `server.ts` - API layer changes only when REST endpoints change
- `index.html` - UI changes only when presentation needs change

## Layer Responsibilities

### 1. Type Definitions Layer (`src/types/`)

**Purpose**: Define data contracts and type shapes

**Contains**:
- Base interfaces (`User`)
- Type aliases for variants (`AuthenticatedUser`)
- DTOs (Data Transfer Objects) like `CreateUserDto`
- Utility type applications (`Partial`, `Omit`, `Pick`, `Record`)

**Dependencies**: None (pure type definitions)

**Example**:
```typescript
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    createdAt: Date;
}

export type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
```

### 2. Core Layer (`src/core/`)

**Purpose**: Define abstractions and contracts

**Contains**:
- Generic interfaces (`IRepository<T>`)
- Shared utility functions (if any)
- Core business rules

**Dependencies**: Type definitions only

**Key Feature**: Generics enable reusability
```typescript
export interface IRepository<T> {
    getAll(): Promise<T[]>;
    // Works for User, Post, Product, etc.
}
```

### 3. Business Logic Layer (`src/features/`)

**Purpose**: Implement business rules and data operations

**Structure**:
```
features/
└── users/
    ├── index.ts              # Public API (Barrel Export)
    ├── user.repository.ts    # Implementation
    └── user.service.ts       # (Optional) Business logic
```

**Responsibilities**:
- Implement repository interfaces
- Handle data validation
- Execute CRUD operations
- Apply business rules

**Public API Pattern**:
```typescript
// index.ts - Controls what's exposed
export { UserRepository } from './user.repository';
export * from '../../types/user.types';
```

### 4. API Layer (`src/server.ts`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Route definitions
- Request validation
- Response formatting
- Error handling
- Static file serving
- Request/response logging

**Logging System**:
- Dual logging (console + file)
- Timestamps on all log entries
- Request tracking with method, URL, and body
- Error tracking with stack traces
- Log file: `server.log`

**Endpoint Structure**:
```typescript
app.get('/api/users', async (req, res) => {
    // GET all users
});

app.post('/api/users', async (req, res) => {
    // CREATE user
});

app.put('/api/users/:id', async (req, res) => {
    // UPDATE user
});

app.delete('/api/users/:id', async (req, res) => {
    // DELETE user
});
```

### 5. Presentation Layer

#### Console Demo (`src/app.ts`)
- Demonstrates TypeScript concepts
- Shows type narrowing and exhaustive checking
- Educational examples

#### Web Interface (`public/index.html`)
- User-friendly UI
- Real-time CRUD operations
- Vanilla JavaScript (no framework dependencies)

## Data Flow

### Create User Flow

```
1. User fills form in Web UI
   ↓
2. JavaScript sends POST /api/users
   ↓
3. Express receives request (server.ts)
   ↓
4. Extract CreateUserDto from req.body
   ↓
5. Call repo.create(userData)
   ↓
6. UserRepository validates input (type narrowing)
   ↓
7. Create User object with generated id & timestamp
   ↓
8. Store in memory array
   ↓
9. Return User object
   ↓
10. Express sends JSON response
   ↓
11. UI updates to show new user
```

### Update User Flow

```
1. User clicks Edit button
   ↓
2. Fetch user data: GET /api/users/:id
   ↓
3. Populate modal form
   ↓
4. User modifies fields
   ↓
5. Submit: PUT /api/users/:id
   ↓
6. repo.update(id, updates)
   ↓
7. Find user by ID
   ↓
8. Merge existing user with updates (spread operator)
   ↓
9. Return updated User
   ↓
10. UI refreshes user list
```

### Delete User Flow

```
1. User clicks Delete button
   ↓
2. Show confirmation dialog
   ↓
3. On confirm: DELETE /api/users/:id
   ↓
4. repo.delete(id)
   ↓
5. Filter user from array
   ↓
6. Return success boolean
   ↓
7. Express sends 204 No Content
   ↓
8. UI removes user card
```

## Type Safety Architecture

### Type Narrowing Strategy

```typescript
async create(input: unknown): Promise<User> {
    // Step 1: Check if input is an object
    if (typeof input === 'object' && input !== null && 'name' in input) {
        // Step 2: Assert to expected type
        const data = input as CreateUserDto;
        
        // Step 3: Now TypeScript knows the shape
        const newUser: User = {
            ...data,
            id: Math.random().toString(36),
            createdAt: new Date()
        };
        
        return newUser;
    }
    
    throw new Error('invalid user data');
}
```

### Exhaustive Type Checking

```typescript
switch (user.role) {
    case 'admin':
        return "Full access";
    case 'editor':
        return "Edit access";
    case 'viewer':
        return "Read access";
    default:
        // If a new role is added but not handled,
        // TypeScript will error here!
        const _exhaustiveCheck: never = user.role;
        return _exhaustiveCheck;
}
```

## Scalability Considerations

### Current Architecture (In-Memory)
- Simple and fast for demos
- No external dependencies
- Data lost on server restart

### Production-Ready Extensions

**1. Database Layer**
```typescript
export class PostgresUserRepository implements IRepository<User> {
    // Use pg or Prisma
}

export class MongoUserRepository implements IRepository<User> {
    // Use MongoDB driver or Mongoose
}
```

**2. Service Layer**
```typescript
export class UserService {
    constructor(private repo: IRepository<User>) {}
    
    async createUser(dto: CreateUserDto) {
        // Validation logic
        // Business rules
        return this.repo.create(dto);
    }
}
```

**3. Authentication & Authorization**
```typescript
export class AuthService {
    verifyToken(token: string): AuthenticatedUser | null;
    checkPermission(user: User, action: string): boolean;
}
```

**4. Error Handling Layer**
```typescript
export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
    }
}
```

## Configuration Management

### TypeScript Configuration

**Key Settings in `tsconfig.json`**:
```json
{
  "compilerOptions": {
    "module": "nodenext",           // ES modules
    "target": "esnext",             // Modern JavaScript
    "strict": true,                  // All strict checks
    "verbatimModuleSyntax": true,   // Enforce type imports
    "noUncheckedIndexedAccess": true // Array safety
  }
}
```

### Module System

**ES Modules** (`"type": "module"` in package.json):
- Requires `.js` extensions in imports (TypeScript limitation)
- Better tree-shaking
- Native browser support
- Modern Node.js standard

## Testing Strategy (Future)

### Unit Tests
```typescript
describe('UserRepository', () => {
    it('should create a user with generated ID', async () => {
        const repo = new UserRepository();
        const user = await repo.create({
            name: 'Test',
            email: 'test@test.com',
            role: 'viewer'
        });
        expect(user.id).toBeDefined();
    });
});
```

### Integration Tests
```typescript
describe('User API', () => {
    it('POST /api/users should create user', async () => {
        const response = await request(app)
            .post('/api/users')
            .send({ name: 'Test', email: 'test@test.com', role: 'admin' });
        
        expect(response.status).toBe(201);
        expect(response.body.name).toBe('Test');
    });
});
```

## Security Considerations

### Current Implementation
- Basic input validation
- Type safety prevents type-related bugs
- No SQL injection risk (no database)

### Production Recommendations
1. **Input Sanitization** - Use libraries like `validator.js`
2. **Authentication** - JWT or session-based
3. **Authorization** - Role-based access control
4. **Rate Limiting** - Prevent abuse
5. **CORS Configuration** - Restrict origins
6. **HTTPS** - Encrypt in transit
7. **Environment Variables** - Store secrets securely

## Performance Considerations

### Current Performance
- In-memory operations: O(n) for most operations
- No database latency
- Synchronous type checking (compile-time)

### Optimization Strategies
1. **Indexing** - Use Map instead of Array for O(1) lookups
2. **Caching** - Cache frequently accessed data
3. **Pagination** - Limit results for large datasets
4. **Lazy Loading** - Load data as needed
5. **Compression** - Gzip responses

---

This architecture provides a solid foundation that can scale from educational demos to production applications while maintaining clean separation of concerns and type safety throughout.
