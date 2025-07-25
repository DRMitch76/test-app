import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, User, Phone, Calendar, Shield, Syringe, AlertTriangle, Pill, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PetDetails } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();

  const product = state.products.find(p => p.id === id);

  const [petDetails, setPetDetails] = useState<PetDetails>({
    productOption: '',
    petName: '',
    age: '',
    chipped: 'no',
    vaccinated: 'no',
    allergies: '',
    medication: '',
    contactNumber: '',
    additionalContact: '',
    vetNumber: '',
    info: '',
    photo: ''
  });

  const [errors, setErrors] = useState<Partial<PetDetails>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'ZAR': return 'R';
      default: return 'R';
    }
  };

  const currentCurrency = localStorage.getItem('shopCurrency') || 'ZAR';
  const currencySymbol = getCurrencySymbol(currentCurrency);

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Service not found</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to ID Tags
        </button>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Partial<PetDetails> = {};

    if (!petDetails.petName.trim()) {
      newErrors.petName = 'Pet name is required';
    }

    if (!petDetails.age.trim()) {
      newErrors.age = 'Age is required';
    }

    if (!petDetails.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,}$/.test(petDetails.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }

    if (!petDetails.productOption) {
      newErrors.productOption = 'Please select a product option';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      navigate('/checkout', { 
        state: { 
          product, 
          petDetails 
        } 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPetDetails(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof PetDetails]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setPetDetails(prev => ({
          ...prev,
          photo: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to ID Tags</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Info */}
        <div className="space-y-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-xl"
          />

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-2 mb-6">
                <span className="text-3xl font-bold text-green-600">
                  {currencySymbol}{product.price.toFixed(2)}
                </span>
              </div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className="mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Pet Details Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pet Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Option *
              </label>
              <select
                name="productOption"
                value={petDetails.productOption}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.productOption ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select an option</option>
                <option value="Standard Tag">Standard Tag</option>
                <option value="Premium Tag">Premium Tag</option>
                <option value="Deluxe Tag">Deluxe Tag</option>
              </select>
              {errors.productOption && (
                <p className="text-red-600 text-sm mt-1">{errors.productOption}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Pet Name *
              </label>
              <input
                type="text"
                name="petName"
                value={petDetails.petName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.petName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your pet's name"
              />
              {errors.petName && (
                <p className="text-red-600 text-sm mt-1">{errors.petName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Age *
              </label>
              <input
                type="text"
                name="age"
                value={petDetails.age}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.age ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 2 years, 6 months"
              />
              {errors.age && (
                <p className="text-red-600 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline h-4 w-4 mr-1" />
                Microchipped
              </label>
              <select
                name="chipped"
                value={petDetails.chipped}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Syringe className="inline h-4 w-4 mr-1" />
                Vaccinated
              </label>
              <select
                name="vaccinated"
                value={petDetails.vaccinated}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Allergies
              </label>
              <textarea
                name="allergies"
                value={petDetails.allergies}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="List any allergies (food, environmental, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Pill className="inline h-4 w-4 mr-1" />
                Medication
              </label>
              <textarea
                name="medication"
                value={petDetails.medication}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="List current medications and dosages"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={petDetails.contactNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.contactNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Your phone number"
              />
              {errors.contactNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.contactNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Additional Contact Number
              </label>
              <input
                type="tel"
                name="additionalContact"
                value={petDetails.additionalContact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Alternative contact number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-1" />
                Vet Contact Number
              </label>
              <input
                type="tel"
                name="vetNumber"
                value={petDetails.vetNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your vet's contact number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="inline h-4 w-4 mr-1" />
                Add Photo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                {photoPreview ? (
                  <div className="space-y-3">
                    <img 
                      src={photoPreview} 
                      alt="Pet preview" 
                      className="h-32 w-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-green-600">Photo selected</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview('');
                        setPetDetails(prev => ({ ...prev, photo: '' }));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload your pet's photo</p>
                    <p className="text-xs text-gray-500 mb-3">Recommended: 400x400px, max 2MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handlePhotoChange}
                />
                {!photoPreview && (
                  <label htmlFor="photo-upload" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer inline-block">
                    Choose Photo
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Proceed to Checkout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}