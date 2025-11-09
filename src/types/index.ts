export type UserRole = "user" | "shop" | "admin";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  type: "veg" | "non-veg" | "beverage";
  cuisine: string;
  prepTime: number;
  image: string;
  description: string;
  reviews?: Review[];
  averageRating?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = "pending" | "approved" | "declined" | "ready" | "completed" | "cancelled";

export type PaymentMode = "cash" | "upi" | "card";

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMode: PaymentMode;
  createdAt: string;
  updatedAt: string;
  prepTime: number;
}

export interface Notification {
  id: string;
  userId: string;
  orderId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
