// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
// This file demonstrates using the repository pattern with TypeScript

import { UserRepository } from "./features/users/index.js";
import type { User } from "./features/users/index.js";

// Create an instance of our repository
// Thanks to Dependency Inversion, we depend on the IRepository interface,
// not on the specific implementation
const repo = new UserRepository();

// Function demonstrating type checking and exhaustive type handling
async function handleUserRole(user: User) {
    // 11. instanceof: Check if an object is an instance of a specific class
    // This is another form of TYPE NARROWING
    // typeof is for primitives, instanceof is for classes
    if (user.createdAt instanceof Date) {
        // Template literal (backticks) allows string interpolation with ${}
        console.log(`User joined on ${user.createdAt.toLocaleDateString()}`);
    }

    // 12. EXHAUSTIVE TYPE CHECKING with 'never'
    // The 'never' type represents values that should never occur
    switch (user.role) {
        case 'admin':
            return "Full access";
        case 'editor':
            return "Edit access";
        case 'viewer':
            return "Read access";
        default:
            // This line is GENIUS for maintainability:
            // If we add a new role to the union type (e.g., 'super-admin'),
            // but forget to add it here, TypeScript will throw a compile error!
            // Why? Because user.role would be 'super-admin' here,
            // but we're trying to assign it to 'never' (impossible!)
            const _exhaustiveCheck: never = user.role;
            return _exhaustiveCheck;
    }
}

// Main function to demonstrate the CRUD operations
async function main() {
    console.log('\n=== TypeScript CRUD App Demo ===\n');

    try {
        // CREATE: Add users with different roles
        console.log('1. Creating users...');
        
        const admin = await repo.create({
            name: 'Alice Admin',
            email: 'alice@example.com',
            role: 'admin'
        });
        console.log('Created admin:', admin);

        const editor = await repo.create({
            name: 'Bob Editor',
            email: 'bob@example.com',
            role: 'editor'
        });
        console.log('Created editor:', editor);

        const viewer = await repo.create({
            name: 'Charlie Viewer',
            email: 'charlie@example.com',
            role: 'viewer'
        });
        console.log('Created viewer:', viewer);

        // READ ALL: Retrieve all users
        console.log('\n2. Reading all users...');
        const allUsers = await repo.getAll();
        console.log(`Found ${allUsers.length} users:`, allUsers.map(u => u.name));

        // READ ONE: Get a specific user by ID
        console.log('\n3. Reading user by ID...');
        const foundUser = await repo.getById(admin.id);
        if (foundUser) {
            console.log('Found user:', foundUser.name);
            
            // Demonstrate role handling
            const access = await handleUserRole(foundUser);
            console.log('Access level:', access);
        }

        // Demonstrate TYPE NARROWING with unknown
        console.log('\n4. Testing type safety with invalid input...');
        try {
            // This should fail because the input is invalid
            await repo.create('not an object');
        } catch (error) {
            console.log('✓ Type narrowing caught invalid input:', (error as Error).message);
        }

        // Demonstrate all roles
        console.log('\n5. Demonstrating role-based access...');
        for (const user of allUsers) {
            const access = await handleUserRole(user);
            console.log(`${user.name} (${user.role}): ${access}`);
        }

        console.log('\n=== Demo Complete ===\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the demo
main();