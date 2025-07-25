import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, Calendar, Shield, Syringe, User, Heart, ArrowLeft, AlertTriangle, Pill } from 'lucide-react';
import { Order } from '../types';
import * as db from '../services/database';

export default function PetProfilePage() {
  const { petProfileId } = useParams<{ petProfileId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPetProfile = async () => {
      if (!petProfileId) {
        setError('No pet profile ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading pet profile for ID:', petProfileId);
        const foundOrder = await db.getOrderByPetProfileId(petProfileId);
        console.log('Found order:', foundOrder);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Pet profile not found');
        }
      } catch (err) {
        console.error('Error loading pet profile:', err);
        setError('Failed to load pet profile');
      } finally {
        setLoading(false);
      }
    };

    loadPetProfile();
  }, [petProfileId]);


  const handleCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pet Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This pet profile doesn\'t exist or has been removed.'}</p>
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-500">Pet Profile ID: {petProfileId}</p>
          </div>
          <Link 
            to="/products" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const { petDetails, deliveryDetails } = order;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Pet Header */}
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
          <div className="text-center text-white">
            <User className="h-20 w-20 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl font-bold">{petDetails.petName}</h1>
            <p className="text-blue-100 text-lg">{petDetails.productOption || 'Pet ID Tag'}</p>
          </div>
        </div>

        {/* Pet Information */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-semibold text-gray-900">{petDetails.age}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Microchipped</p>
                <p className="font-semibold text-gray-900 capitalize">{petDetails.chipped}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Syringe className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Vaccinated</p>
                <p className="font-semibold text-gray-900 capitalize">{petDetails.vaccinated}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {(petDetails.info || petDetails.allergies || petDetails.medication) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {petDetails.info && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Additional Information</p>
                      <p className="text-gray-900">{petDetails.info}</p>
                    </div>
                  </div>
                )}

                {petDetails.allergies && (
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-600 mb-1 font-medium">Allergies</p>
                      <p className="text-gray-900">{petDetails.allergies}</p>
                    </div>
                  </div>
                )}

                {petDetails.medication && (
                  <div className="flex items-start space-x-3">
                    <Pill className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-600 mb-1 font-medium">Medication</p>
                      <p className="text-gray-900">{petDetails.medication}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>

            <button
              onClick={() => handleCall(petDetails.contactNumber)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Call Primary Contact</span>
            </button>

            {petDetails.additionalContact && (
              <button
                onClick={() => handleCall(petDetails.additionalContact)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Phone className="h-5 w-5" />
                <span>Call Secondary Contact</span>
              </button>
            )}

            {petDetails.vetNumber && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Veterinarian</p>
                    <p className="text-red-800 font-semibold">{petDetails.vetNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Owner Information</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>{deliveryDetails.fullName}</p>
              <p>{deliveryDetails.address}</p>
              <p>{deliveryDetails.city}, {deliveryDetails.postalCode}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-gray-500">
                Powered by TrackMy Tail
              </p>
            </div>
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Visit TrackMy Tail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}