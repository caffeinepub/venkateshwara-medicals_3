import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    featured: boolean;
    inStock: boolean;
    name: string;
    description: string;
    category: Category;
    price: number;
}
export interface OrderItem {
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: number;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    createdAt: bigint;
    totalAmount: number;
    address: string;
    phone: string;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    medicalDevices = "medicalDevices",
    healthSupplements = "healthSupplements",
    babyCare = "babyCare",
    otcMedicines = "otcMedicines",
    prescriptionMedicines = "prescriptionMedicines",
    personalCare = "personalCare"
}
export enum OrderStatus {
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
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
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, phone: string, address: string, items: Array<OrderItem>, totalAmount: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProductsByName(searchTerm: string): Promise<Array<Product>>;
    seedSampleProducts(): Promise<void>;
    toggleFeaturedStatus(id: bigint): Promise<void>;
    toggleStockStatus(id: bigint): Promise<void>;
    updateProduct(id: bigint, name: string, category: Category, description: string, price: number): Promise<void>;
}
