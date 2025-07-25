import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Key, Package, User, MapPin, Phone, Download, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { downloadQRCode } from '../utils/qrGenerator';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderKey, setOrderKey] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { state } = useApp();

  useEffect(() => {
    const orderKeyParam = searchParams.get('orderKey');
    if (orderKeyParam) {
      setOrderKey(orderKeyParam);
      // Look for the order in the current state
      const foundOrder = state.orders.find(o => o.orderKey === orderKeyParam);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [searchParams, state.orders]);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'ZAR': return 'R';
      default: return 'R';
    }
  };

  const currentCurrency = localStorage.getItem('shopCurrency') || 'ZAR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const handleDownloadQR = () => {
    if (order?.qrCodeUrl) {
      downloadQRCode(order.qrCodeUrl, order.petDetails.petName);
    }
  };

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Order not found. Please check your order key.</p>
        <Link to="/products" className="mt-4 text-blue-600 hover:text-blue-700 font-medium">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for choosing PetCare Pro</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Key className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">Your Order Key</h2>
        </div>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-3xl font-mono font-bold text-blue-600 text-center tracking-wider">
            {orderKey}
          </p>
        </div>
        <p className="text-sm text-blue-700 mt-3">
          <strong>Important:</strong> Save this key! You'll need it to track your order and manage your account.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>

        <div className="space-y-4">
          <div className="flex space-x-4">
            <img
              src={order.product.image}
              alt={order.product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{order.product.name}</h3>
              <p className="text-sm text-gray-600">Order ID: {order.id}</p>
              <p className="text-lg font-bold text-green-600">{currencySymbol}{order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Pet Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pet Name</label>
            <p className="text-gray-900">{order.petDetails.petName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Option</label>
            <p className="text-gray-900">{order.petDetails.productOption}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <p className="text-gray-900">{order.petDetails.age}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Microchipped</label>
            <p className="text-gray-900 capitalize">{order.petDetails.chipped}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vaccinated</label>
            <p className="text-gray-900 capitalize">{order.petDetails.vaccinated}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <p className="text-gray-900">{order.petDetails.contactNumber}</p>
          </div>
          {order.petDetails.additionalContact && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Additional Contact</label>
              <p className="text-gray-900">{order.petDetails.additionalContact}</p>
            </div>
          )}
          {order.petDetails.vetNumber && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Vet Contact</label>
              <p className="text-gray-900">{order.petDetails.vetNumber}</p>
            </div>
          )}
          {order.petDetails.info && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Additional Information</label>
              <p className="text-gray-900">{order.petDetails.info}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Service Location
        </h2>

        <div className="space-y-2">
          <p className="text-gray-900 font-medium">{order.deliveryDetails.fullName}</p>
          <p className="text-gray-900">{order.deliveryDetails.address}</p>
          <p className="text-gray-900">{order.deliveryDetails.city}, {order.deliveryDetails.postalCode}</p>
          <p className="text-gray-900 flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            {order.deliveryDetails.phone}
          </p>
        </div>
      </div>

      {order.qrCodeUrl && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Download className="h-5 w-5 mr-2" />
            Download QR Code
          </h2>
          <img src={order.qrCodeUrl} alt="QR Code" className="mx-auto mb-4" style={{ maxWidth: '200px' }} />
          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          What's Next?
        </h2>

        <ul className="space-y-2 text-green-800">
          <li>• Our team will contact you within 24 hours to schedule your service</li>
          <li>• You'll receive email updates about your order status</li>
          <li>• Use your order key to track progress and manage your account</li>
          <li>• For immediate questions, call our 24/7 support: 1-800-PET-CARE</li>
        </ul>
      </div>

      <div className="text-center space-y-4">
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Browse More Services
        </Link>
        <p className="text-sm text-gray-600">
          Save your order key: <strong>{orderKey}</strong>
        </p>
      </div>
    </div>
  );
}