import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, User, ShoppingBag, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LoginModal from './LoginModal';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT_USER' });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TrackMy Tail</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                } transition-colors duration-200 flex items-center space-x-1`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/products"
                className={`${
                  isActive('/products') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                } transition-colors duration-200 flex items-center space-x-1`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>ID Tags</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {state.isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span>
                      {state.isAdmin ? 'Admin Panel' : (state.currentUser?.username || 'Dashboard')}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">Track My Tail</span>
              </div>
              <p className="text-gray-400">
                Smart, scannable ID Tags to help lost pets get home faster - because every second counts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Pet Spoils</li>
                <li>Health Checkups</li>
                <li>Grooming</li>
                <li>Emergency Care</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>saharaspawsomegifts@gmail.com</li>
                <li>+27 78 722-7158</li>
                <li>Available on WhatsApp</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TrackMy Tail. Powered by Sahara's Pawsome Gifts. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}