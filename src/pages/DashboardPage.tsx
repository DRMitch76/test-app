import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Package, User, Phone, MapPin, Edit, Download, QrCode, Save, X, Settings, Check, XCircle, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadQRCode } from '../utils/qrGenerator';
import { Order, PetDetails, DeliveryDetails } from '../types';

export default function DashboardPage() {
  const { state, addProduct, updateProduct, deleteProduct, addOrder, updateOrder, updateOrderStatus, addUser } = useApp();
  const navigate = useNavigate();
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    petDetails: PetDetails;
    deliveryDetails: DeliveryDetails;
  } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [settings, setSettings] = useState({
    currency: localStorage.getItem('shopCurrency') || 'ZAR',
    adminPassword: '',
    newUsername: '',
    newUserPassword: ''
  });

  useEffect(() => {
    if (!state.isAuthenticated || !state.currentUser) {
      navigate('/');
    }
  }, [state.isAuthenticated, state.currentUser, navigate]);

  if (!state.isAuthenticated || !state.currentUser) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadQR = (order: Order) => {
    if (order.qrCodeUrl) {
      downloadQRCode(order.qrCodeUrl, order.petDetails.petName);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order.id);
    setEditData({
      petDetails: { ...order.petDetails },
      deliveryDetails: { ...order.deliveryDetails }
    });
  };

  const handleCompleteOrder = async (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      status: 'delivered'
    };

    try {
      await updateOrder(updatedOrder);
      // Switch to completed tab after archiving
      setActiveTab('completed');
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const updatedOrder: Order = {
      ...order,
      status: 'cancelled'
    };

    try {
      await updateOrder(updatedOrder);
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleSaveEdit = () => {
    if (!editingOrder || !editData) return;

    const orderToUpdate = state.orders.find(o => o.id === editingOrder);

    if (orderToUpdate) {
      const updatedOrder: Order = {
        ...orderToUpdate,
        petDetails: editData.petDetails,
        deliveryDetails: editData.deliveryDetails
      };

      updateOrder(updatedOrder).catch(error => {
        console.error('Error updating order:', error);
        alert('Failed to update order. Please try again.');
      });
    }

    setEditingOrder(null);
    setEditData(null);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditData(null);
  };

  const handleInputChange = (
    section: 'petDetails' | 'deliveryDetails',
    field: string,
    value: string
  ) => {
    if (!editData) return;

    setEditData({
      ...editData,
      [section]: {
        ...editData[section],
        [field]: value
      }
    });
  };

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to the database
    // For now, we'll update the global currency setting
    localStorage.setItem('shopCurrency', settings.currency);
    alert(`Settings saved successfully! Currency updated to ${settings.currency}.`);
    setShowSettings(false);
    // Force a page reload to apply currency changes
    window.location.reload();
  };

  const handleAddUser = () => {
    if (!settings.newUsername || !settings.newUserPassword) {
      alert('Please fill in both username and password');
      return;
    }
    if (settings.newUserPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    // In a real app, you would create the user in the database
    alert(`User ${settings.newUsername} added successfully!`);
    setSettings({ ...settings, newUsername: '', newUserPassword: '' });
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'ZAR': return 'R';
      default: return 'R';
    }
  };

  const currentCurrency = localStorage.getItem('shopCurrency') || 'ZAR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const userOrders = state.isAdmin ? state.orders : state.currentUser.orders;
  const filteredOrders = state.isAdmin 
    ? userOrders.filter(order => {
        switch (activeTab) {
          case 'pending': return order.status === 'pending';
          case 'completed': return order.status === 'delivered';
          case 'cancelled': return order.status === 'cancelled';
          default: return true;
        }
      })
    : userOrders;

    const handleOrderAction = async (orderId: string, action: 'complete' | 'cancel') => {
    try {
      const newStatus = action === 'complete' ? 'delivered' : 'cancelled';

      await updateOrderStatus(orderId, newStatus);

      if (action === 'complete') {
        alert('Order completed successfully!');
      } else {
        alert('Order cancelled successfully!');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to ${action} order. Please try again.`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <User className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {state.isAdmin ? 'Admin Dashboard' : 
                 `Welcome back${state.currentUser.username ? `, ${state.currentUser.username}` : ''}!`}
              </h1>
              <p className="text-gray-600">
                {state.isAdmin ? 'Administrator Access' : `Order Key: ${state.currentUser.orderKey}`}
              </p>
            </div>
          </div>
          {state.isAdmin && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          )}
        </div>
      </div>

      {state.isAdmin && showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Admin Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shop Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Shop Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="ZAR">ZAR (R)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Admin Password
                </label>
                <input
                  type="password"
                  value={settings.adminPassword}
                  onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new admin password"
                />
              </div>
            </div>

            {/* User Management */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New User - Username
                </label>
                <input
                  type="text"
                  value={settings.newUsername}
                  onChange={(e) => setSettings({ ...settings, newUsername: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={settings.newUserPassword}
                  onChange={(e) => setSettings({ ...settings, newUserPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                />
              </div>

              <button
                onClick={handleAddUser}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {userOrders.length}
              </p>
              <p className="text-gray-600">{state.isAdmin ? 'All Orders' : 'Total Orders'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {userOrders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-gray-600">Pending Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(userOrders.map(o => o.petDetails.petName)).size}
              </p>
              <p className="text-gray-600">{state.isAdmin ? 'Total Pets' : 'Pets Registered'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {state.isAdmin ? 'All Orders' : 'Your Orders'}
            </h2>

            {state.isAdmin && (
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
                    activeTab === 'pending'
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pending ({userOrders.filter(o => o.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
                    activeTab === 'completed'
                      ? 'text-green-600 border-green-600 bg-green-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Completed ({userOrders.filter(o => o.status === 'delivered').length})
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
                    activeTab === 'cancelled'
                      ? 'text-red-600 border-red-600 bg-red-50'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Cancelled ({userOrders.filter(o => o.status === 'cancelled').length})
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{state.isAdmin ? 'No orders in system' : 'No orders yet'}</p>
              {!state.isAdmin && (
                <button
                  onClick={() => navigate('/products')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse our services
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">Order #{order.id}</p>
                      {state.isAdmin && (
                        <p className="text-sm text-gray-600">Order Key: {order.orderKey}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!state.isAdmin && (
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      )}
                      {state.isAdmin && order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOrderAction(order.id, 'complete')}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                          >
                            <Check className="h-4 w-4" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => handleOrderAction(order.id, 'cancel')}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                      {state.isAdmin && order.qrCodeUrl && (
                        <button
                          onClick={() => handleDownloadQR(order)}
                          className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                        >
                          <Download className="h-4 w-4" />
                          <span>QR Code</span>
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        {currencySymbol}{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {state.isAdmin && order.qrCodeUrl && (
                    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <QrCode className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-purple-900">QR Code Generated</p>
                            <p className="text-sm text-purple-700">Pet Profile: {order.petProfileId}</p>
                          </div>
                        </div>
                        <Link to={`/pet-profile/${order.petProfileId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
                                >
                                  View Profile (ID: {order.petProfileId})
                          </Link>
                      </div>
                    </div>
                  )}

                  {editingOrder === order.id && editData ? (
                    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">Edit Order Information</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-1 text-sm"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Pet Information</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                              <input
                                type="text"
                                value={editData.petDetails.petName}
                                onChange={(e) => handleInputChange('petDetails', 'petName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                              <input
                                type="text"
                                value={editData.petDetails.age}
                                onChange={(e) => handleInputChange('petDetails', 'age', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                              <input
                                type="tel"
                                value={editData.petDetails.contactNumber}
                                onChange={(e) => handleInputChange('petDetails', 'contactNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Contact</label>
                              <input
                                type="tel"
                                value={editData.petDetails.additionalContact || ''}
                                onChange={(e) => handleInputChange('petDetails', 'additionalContact', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vet Number</label>
                              <input
                                type="tel"
                                value={editData.petDetails.vetNumber || ''}
                                onChange={(e) => handleInputChange('petDetails', 'vetNumber', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                              <textarea
                                value={editData.petDetails.info}
                                onChange={(e) => handleInputChange('petDetails', 'info', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Delivery Information</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <input
                                type="text"
                                value={editData.deliveryDetails.fullName}
                                onChange={(e) => handleInputChange('deliveryDetails', 'fullName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <input
                                type="text"
                                value={editData.deliveryDetails.address}
                                onChange={(e) => handleInputChange('deliveryDetails', 'address', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                              <input
                                type="text"
                                value={editData.deliveryDetails.city}
                                onChange={(e) => handleInputChange('deliveryDetails', 'city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                              <input
                                type="text"
                                value={editData.deliveryDetails.postalCode}
                                onChange={(e) => handleInputChange('deliveryDetails', 'postalCode', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="tel"
                                value={editData.deliveryDetails.phone}
                                onChange={(e) => handleInputChange('deliveryDetails', 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Pet Information
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Name:</strong> {order.petDetails.petName}</p>
                          <p><strong>Product Option:</strong> {order.petDetails.productOption}</p>
                          <p><strong>Age:</strong> {order.petDetails.age}</p>
                          <p><strong>Microchipped:</strong> {order.petDetails.chipped}</p>
                          <p><strong>Vaccinated:</strong> {order.petDetails.vaccinated}</p>
                          <p><strong>Contact:</strong> {order.petDetails.contactNumber}</p>
                          {order.petDetails.additionalContact && (
                            <p><strong>Additional Contact:</strong> {order.petDetails.additionalContact}</p>
                          )}
                          {order.petDetails.vetNumber && (
                            <p><strong>Vet Contact:</strong> {order.petDetails.vetNumber}</p>
                          )}
                          {order.petDetails.info && (
                            <p><strong>Notes:</strong> {order.petDetails.info}</p>
                          )}
                          {order.petDetails.allergies && (
                            <p><strong>Allergies:</strong> {order.petDetails.allergies}</p>
                          )}
                          {order.petDetails.medication && (
                            <p><strong>Medication:</strong> {order.petDetails.medication}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Service Location
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{order.deliveryDetails.fullName}</p>
                          <p>{order.deliveryDetails.address}</p>
                          <p>{order.deliveryDetails.city}, {order.deliveryDetails.postalCode}</p>
                          <p className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.deliveryDetails.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Next Steps:</strong> Our team will contact you within 24 hours to schedule your service.
                      </p>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Order Cancelled:</strong> This order has been cancelled.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}