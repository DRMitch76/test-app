import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Order, User } from '../types';
import * as db from '../services/database';

interface AppState {
  products: Product[];
  orders: Order[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'LOGIN_ADMIN' };

const initialState: AppState = {
  products: [],
  orders: [],
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") => Promise<void>;
  loginWithOrderKey: (orderKey: string) => Promise<User | null>;
  createUserCredentials: (orderKey: string, username: string, password: string) => Promise<void>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      const updatedOrders = state.orders.map(o => o.id === action.payload.id ? action.payload : o);
      const updatedCurrentUser = state.currentUser ? {
        ...state.currentUser,
        orders: state.currentUser.orders.map(o => o.id === action.payload.id ? action.payload : o)
      } : null;
      return {
        ...state,
        orders: updatedOrders,
        currentUser: updatedCurrentUser
      };
    case 'LOGIN_USER':
      return { 
        ...state, 
        currentUser: action.payload, 
        isAuthenticated: true,
        isAdmin: action.payload.isAdmin || false
      };
    case 'LOGOUT_USER':
      return { ...state, currentUser: null, isAuthenticated: false, isAdmin: false };
    case 'LOGIN_ADMIN':
      const adminUser: User = {
        orderKey: 'ADMIN001',
        username: 'Admin',
        password: 'E1leen@1964',
        orders: [],
        isAdmin: true
      };
      return { 
        ...state, 
        currentUser: adminUser, 
        isAuthenticated: true, 
        isAdmin: true 
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const products = await db.getProducts();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    } catch (error) {
      console.error('Error loading products:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load products' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadOrders = async () => {
    try {
      const orders = await db.getOrders();
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error) {
      console.error('Error loading orders:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load orders' });
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newProduct = await db.addProduct(product);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    } catch (error) {
      console.error('Error adding product:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedProduct = await db.updateProduct(product);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await db.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete product' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newOrder = await db.addOrder(order);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add order' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateOrderInDb = async (order: Order) => {
    try {
      const updatedOrder = await db.updateOrder(order);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const updateOrderStatusInDb = async (orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") => {
    try {
      await db.updateOrderStatus(orderId, status);
      // Find and update the order in state
      const orderToUpdate = state.orders.find(order => order.id === orderId);
      if (orderToUpdate) {
        const updatedOrder = { ...orderToUpdate, status };
        dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const loginWithOrderKey = async (orderKey: string): Promise<User | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Check if user exists
      let user = await db.getUserByOrderKey(orderKey);

      if (!user) {
        // Check if there are orders with this key
        const orders = await db.getOrdersByOrderKey(orderKey);
        if (orders.length > 0) {
          // Create user account
          user = await db.createUser(orderKey);
        }
      }

      return user;
    } catch (error) {
      console.error('Error logging in with order key:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to login' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createUserCredentials = async (orderKey: string, username: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // In a real app, you'd hash the password
      const passwordHash = btoa(password); // Simple base64 encoding for demo
      await db.updateUserCredentials(orderKey, username, passwordHash);
    } catch (error) {
      console.error('Error creating user credentials:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create credentials' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProductInDb = async (product: Product) => {
    try {
      const updatedProduct = await db.updateProduct(product);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProductFromDb = async (productId: string) => {
    try {
      await db.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addOrderToDb = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      const newOrder = await db.addOrder(order);
      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };
  
  const updateUserCredentialsInDb = async (orderKey: string, username: string, password: string) => {
    try {
      // In a real app, you'd hash the password
      const passwordHash = btoa(password); // Simple base64 encoding for demo
      await db.updateUserCredentials(orderKey, username, passwordHash);
    } catch (error) {
      console.error('Error creating user credentials:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch,
      loadProducts,
      loadOrders,
      addProduct,
      updateProduct: updateProductInDb,
      deleteProduct: deleteProductFromDb,
      addOrder: addOrderToDb,
      updateOrder: updateOrderInDb,
      updateOrderStatus: updateOrderStatusInDb,
      loginWithOrderKey,
      createUserCredentials: updateUserCredentialsInDb
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}