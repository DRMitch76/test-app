import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import AddProductModal from '../components/AddProductModal';

export default function ProductsPage() {
  const { state, addProduct: addProductToDb, updateProduct: updateProductInDb, deleteProduct: deleteProductFromDb } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductFromDb(productId).catch(error => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      });
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'C$';
      case 'ZAR': return 'R';
      default: return '$';
    }
  };

  const currentCurrency = localStorage.getItem('shopCurrency') || 'ZAR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet ID Tags with a Purpose</h1>
          <p className="text-gray-600 mt-2">
            Keep your furry family safe with our custom tags - Scannable, Smart, Stylish?
          </p>
        </div>
        {state.isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Service</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                {state.isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-green-600">
                    {currencySymbol}{product.price.toFixed(2)}
                  </span>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Buy Now
                </Link>
              </div>

              <div className="mt-3">
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services available yet.</p>
          {state.isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first service
            </button>
          )}
        </div>
      )}

      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} />
      )}

      {editingProduct && (
        <AddProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}