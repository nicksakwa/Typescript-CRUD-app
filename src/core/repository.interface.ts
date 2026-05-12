// ============================================================================
// DEPENDENCY INVERSION PRINCIPLE (DIP)
// ============================================================================
// High-level modules should NOT depend on low-level modules.
// Both should depend on ABSTRACTIONS (interfaces).
// 
// This interface defines WHAT operations are needed, not HOW to implement them.
// We could swap this with PostgresRepository, MongoRepository, etc.
// without changing any code that uses IRepository.

// 8. GENERICS <T>: Type Parameters
// Generics allow us to write reusable code that works with ANY type.
// <T> is a placeholder - it gets replaced with the actual type when used.
// Think of it like a function parameter, but for types!
export interface IRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T | null>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}