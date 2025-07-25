import React, { useState } from 'react';
import { X, Key, User, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { state, dispatch } = useApp();
  const [orderKey, setOrderKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'login' | 'create' | 'admin' | 'registered'>('login');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleKeyLogin = () => {
    // Check for admin login
    if (orderKey === 'ADMIN' && step === 'login') {
      setStep('admin');
      setError('');
      return;
    }

    if (orderKey.length !== 8) {
      setError('Order key must be 8 characters long');
      return;
    }

    // Find user by order key
    const userOrder = state.orders.find(order => order.orderKey === orderKey);
    if (!userOrder) {
      setError('Invalid order key');
      return;
    }

    // Check if user already has credentials
    const existingUser = state.orders
      .filter(order => order.orderKey === orderKey)
      .find(order => order.id === userOrder.id);

    const user = {
      orderKey,
      orders: state.orders.filter(order => order.orderKey === orderKey)
    };

    setCurrentUser(user);

    // If user doesn't have username/password, prompt to create them
    if (!existingUser || !username) {
      setStep('create');
      setError('');
    } else {
      dispatch({ type: 'LOGIN_USER', payload: user });
      onClose();
    }
  };

  const handleCreateCredentials = () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const userWithCredentials = {
      ...currentUser,
      username,
      password
    };

    dispatch({ type: 'LOGIN_USER', payload: userWithCredentials });
    dispatch({ type: 'UPDATE_USER_CREDENTIALS', payload: { username, password } });
    onClose();
  };

  const handleRegisteredUserLogin = () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    // Find user with matching username and password
    // In a real app, you'd hash the password and compare with stored hash
    const userOrders = state.orders.filter(order => {
      // This is a simplified check - in production you'd verify against hashed passwords
      return order.petDetails && order.deliveryDetails;
    });

    if (userOrders.length === 0) {
      setError('Invalid username or password');
      return;
    }

    // For demo purposes, we'll use the first matching order's orderKey
    const orderKey = userOrders[0].orderKey;
    const user = {
      orderKey,
      username,
      orders: state.orders.filter(order => order.orderKey === orderKey)
    };

    dispatch({ type: 'LOGIN_USER', payload: user });
    onClose();
  };

  const handleAdminLogin = () => {
    if (username !== 'Admin' || password !== 'E1leen@1964') {
      setError('Invalid admin credentials');
      return;
    }

    dispatch({ type: 'LOGIN_ADMIN' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'login' ? 'Login Options' : 
             step === 'create' ? 'Create Account' : 
             step === 'admin' ? 'Admin Login' : 'Registered User Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'login' ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <button
                onClick={() => setStep('registered')}
                className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 w-full max-w-xs"
              >
                <User className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Registered User</span>
                <span className="text-xs text-gray-500 text-center">Login with username & password</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Key (8 characters)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={orderKey}
                  onChange={(e) => setOrderKey(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your order key"
                />
              </div>
            </div>

            <button
              onClick={handleKeyLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Login with Order Key
            </button>

            <p className="text-sm text-gray-600 text-center">
              Don't have an order key? Make a purchase first to receive your unique key.
            </p>
          </div>
        ) : step === 'registered' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              onClick={handleRegisteredUserLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Login
            </button>

            <button
              onClick={() => {
                setStep('login');
                setUsername('');
                setPassword('');
                setError('');
              }}
              className="w-full text-gray-600 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Login Options
            </button>
          </div>
        ) : step === 'admin' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Admin Login
            </button>

            <button
              onClick={() => {
                setStep('login');
                setOrderKey('');
                setUsername('');
                setPassword('');
                setError('');
              }}
              className="w-full text-gray-600 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Login Options
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              onClick={handleCreateCredentials}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Create Account
            </button>

            <button
              onClick={() => {
                setStep('login');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="w-full text-gray-600 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              Back to Login Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}