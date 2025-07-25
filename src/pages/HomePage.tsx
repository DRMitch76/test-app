import { ArrowRight, Award, Clock, Heart, Shield } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-20">

      <section className="text-center space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The Pet ID system
            <span className="text-blue-600 block">that moves with you</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Smart Tags for Smart Pets and even smarter humans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Explore ID Tags</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
           
          </div>
        </div>
      </section>


      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">How it works</h3>
          <p className="text-gray-600">
            Scan the QR code with a phone to instantly access your pet’s info—like your contact details, vet info, and medical needs—so they can get home safe & fast!
          </p>
        </div>

        <div className="text-center space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Ready to Order Your Pet's ID Tag?</h3>
          <p className="text-gray-600">
            It's easy! Just open the app, complete the form with your pet’s info, your contact details, and what you want on the QR code. Add your fur baby’s name for the front of the tag and upload a cute photo—we’ll handle the rest!
          </p>
        </div>

        <div className="text-center space-y-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Need to Update Your Info?</h3>
          <p className="text-gray-600">
            No problem! After ordering your tag, you’ll get a once-off unique code to access your pet’s profile. From there, you can set your own password and log in anytime to update details like your phone number, address, or vet info. Keeping it current keeps your fur baby safe! 
          </p>
        </div>
      </section>


      <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            TrackMy Tail QR ID Tags
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Why TrackMy Tails Uses QR Codes. QR codes have been around for a while, but at Sahara’s Pawsome Gifts, we believe they’re one of the smartest, fastest ways to help lost or injured pets. With just a quick scan, anyone can access your pet’s profile—showing contact info, allergies, medications, and more. It’s all about getting your fur baby home safe, or helping them quickly if they’re hurt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <img
              src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"
              alt="Dog Training"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dog ID Tags</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive training programs designed to build better relationships between you and your pet.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">From R299</span>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <img
              src="https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg"
              alt="Pet Health"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cat ID Tags</h3>
            <p className="text-gray-600 mb-4">
              Complete health checkups and preventive care to ensure your pet's long-term wellbeing.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">From R149</span>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      
    </div>
  );
}