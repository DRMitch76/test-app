import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, User, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeliveryDetails, PaymentDetails, Order } from '../types';
import { generateQRCode } from '../utils/qrGenerator';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder } = useApp();

  const { product, petDetails } = location.state || {};

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  if (!product || !petDetails) {
    navigate('/products');
    return null;
  }

  const generateOrderKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generatePetProfileId = () => {
    // Create a more unique and shorter ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    const petProfileId = `${timestamp}-${random}`;
    console.log('Generated Pet Profile ID:', petProfileId);
    return petProfileId;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Delivery validation
    if (!deliveryDetails.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!deliveryDetails.address.trim()) newErrors.address = 'Address is required';
    if (!deliveryDetails.city.trim()) newErrors.city = 'City is required';
    if (!deliveryDetails.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!deliveryDetails.phone.trim()) newErrors.phone = 'Phone number is required';

    // No payment validation needed for test mode

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderKey = generateOrderKey();
    const petProfileId = generatePetProfileId();

    // Generate QR code
    let qrCodeUrl = '';
    try {
      qrCodeUrl = await generateQRCode(petProfileId);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }

    const order: Order = {
      id: '', // Will be set by database
      orderKey,
      petProfileId,
      product,
      petDetails,
      deliveryDetails,
      paymentDetails: {
        expiryDate: 'TEST',
        cardholderName: 'Test Payment'
      },
      status: 'pending',
      createdAt: '', // Will be set by database
      total: product.price,
      qrCodeUrl
    };

    try {
      await addOrder(order);
    } catch (error) {
      console.error('Error creating order:', error);
    }

    navigate(`/order-confirmation?orderKey=${orderKey}`);
  };

  const handleDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (formattedValue.length > 5) return;
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const serviceFee = product.price * 0.05;
  const total = product.price + serviceFee;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">For: {petDetails.petName}</p>
                  <p className="text-lg font-bold text-green-600">R{product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span>R{product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span>R{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Details
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryDetails.fullName}
                    onChange={handleDeliveryChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={deliveryDetails.address}
                    onChange={handleDeliveryChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Street address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryDetails.city}
                      onChange={handleDeliveryChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={deliveryDetails.postalCode}
                      onChange={handleDeliveryChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.postalCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Postal code"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryDetails.phone}
                    onChange={handleDeliveryChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Test Payment Mode
              </h2>

              <div className="text-center">
                <p className="text-green-800 mb-4">
                  <strong>Test Mode Enabled</strong>
                </p>
                <p className="text-sm text-green-700">
                  No payment details required. This is for testing purposes only.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-semibold flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Complete Test Order - R{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}