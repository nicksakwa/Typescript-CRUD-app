// ============================================================================
// HIGH COHESION - All User data operations are grouped together
// ============================================================================
// This class handles ONLY User-related database logic.
// It doesn't mix concerns (like handling HTTP requests or business rules).

// ====type =======================================================.js"===============
// HIGHtype  COHESION - All User data operations are grouped tog.jsether
// ============================================================================
// This class handles ONLY User-related database logic.
// It doesn't mix concerns (like handling HTTP requests or business rules).

import type { IRepository }  from  "../../core/repository.interface.js";
import type { User, CreateUserDto } from "../../types/user.types.js";

export class UserRepository implements IRepository<User> {
    private users: User[] = [];
    async getAll(): Promise<User[]> {
        return this.users;
    }
    async getById(id: string): Promise<User | null> {
        // find() returns the item or undefined
        // || null converts undefined to null (matching our return type)
        return this.users.find(u => u.id === id) || null;
    }
    async create(input: unknown): Promise<User> {
        // 10. TYPE NARROWING: Checking types at runtime
        // We verify the input is actually an object with the properties we need
        // typeof checks primitive types: 'string', 'number', 'object', etc.
        if (typeof input === 'object' && input !== null && 'name' in input) {
            const data = input as CreateUserDto;
            const newUser: User = {
                ...data,                           // Spread operator: copy all properties
                id: Math.random().toString(36),    // Generate random ID
                createdAt: new Date(),             // Set creation timestamp
                role: data.role || 'viewer'        // Default to 'viewer' if not provided
            };
            
            this.users.push(newUser);
            return newUser;
        }
        
        // If input is invalid, throw an error
        throw new Error('invalid user data');
    }

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

    async delete(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== id);
        return this.users.length < initialLength;
    }
}