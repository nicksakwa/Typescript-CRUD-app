// ============================================================================
// SHARED CONTRACTS - This file defines the "shape" of our data
// ============================================================================

// 1. INTERFACE vs TYPE ALIAS
// Use INTERFACES for objects that might be extended later.
// Interfaces can be "reopened" and merged, while type aliases cannot.
export interface User {
    id: string;              // Unique identifier
    name: string;            // User's display name
    email: string;           // Email address  
    role: 'admin' | 'editor' | 'viewer'; // 2. UNION TYPE: Limits values to exactly these 3 strings
    createdAt: Date;         // Timestamp of when user was created
}

// 3. INTERSECTION TYPE (&): Combines multiple types into one
// AuthenticatedUser has ALL properties from User PLUS a token property
export type AuthenticatedUser = User & { token: string };

// 4. UTILITY TYPE: Omit<Type, Keys>
// Creates a new type by REMOVING specified properties from an existing type
// When creating a user, we don't have an ID or createdAt yet (those are generated)
export type CreateUserDto = Omit<User, 'id' | 'createdAt'>; 

// 5. UTILITY TYPE: Pick<Type, Keys>
// Creates a new type by SELECTING only specified properties from an existing type
// Useful for list views where we only need minimal data
export type UserSummary = Pick<User, 'id' | 'name'>;

// 6. UTILITY TYPE: Partial<Type>
// Makes ALL properties optional - useful for updates where user might only change some fields
export type UpdateUserDto = Partial<CreateUserDto>;

// 7. UTILITY TYPE: Record<Keys, Type>
// Creates an object type with specified keys and value types
// Perfect for creating dictionaries/maps indexed by a key
export type UserMap = Record<string, User>; // string keys → User values