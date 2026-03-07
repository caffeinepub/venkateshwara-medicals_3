import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    featured: boolean;
    inStock: boolean;
    name: string;
    description: string;
    category: Category;
    price: number;
}
export enum Category {
    medicalDevices = "medicalDevices",
    healthSupplements = "healthSupplements",
    babyCare = "babyCare",
    otcMedicines = "otcMedicines",
    prescriptionMedicines = "prescriptionMedicines",
    personalCare = "personalCare"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: Category, description: string, price: number): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProductsByName(searchTerm: string): Promise<Array<Product>>;
    seedSampleProducts(): Promise<void>;
    toggleFeaturedStatus(id: bigint): Promise<void>;
    toggleStockStatus(id: bigint): Promise<void>;
    updateProduct(id: bigint, name: string, category: Category, description: string, price: number): Promise<void>;
}
