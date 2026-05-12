// ============================================================================
// PUBLIC API / BARREL EXPORT
// ============================================================================
// This file acts as the "front door" to the users module.
// Other parts of the app import from HERE, not from individual files.
// This gives us LOOSE COUPLING - we can refactor internal file structure
// without breaking imports throughout the codebase.

// Export the UserRepository class
export { UserRepository } from "./user.repository.js";

// Export ALL types from user.types.ts
// This re-exports User, CreateUserDto, UpdateUserDto, etc.
export * from "../../types/user.types.js";
