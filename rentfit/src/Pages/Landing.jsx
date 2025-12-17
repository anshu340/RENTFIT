import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import {
  FaBagShopping,
  FaClock,
  FaMapLocationDot,
  FaShield,
  FaLock,
  FaHeart
} from "react-icons/fa6";

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
      <div className={`w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="text-white text-xl" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

const Landing = () => {
  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Rent. Wear. Return.
                <br />
                Sustainable Fashion.
              </h1>
              <p className="text-purple-100 mb-6 max-w-md">
                Access premium clothing for any occasion without the commitment.
                Join the sustainable fashion revolution with RentFit.
              </p>
              <div className="flex gap-4">
                <button className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-100">
                  Start Browsing
                </button>
                <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700">
                  Learn More
                </button>
              </div>
            </div>

            {/* Image */}
          {/* <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-sm">
              <img
                src="https://images.unsplash.com/photo-1520975916090-3105956dac38"
                alt="Fashion"
                className="w-full h-64 object-cover"
              />
            </div>
          </div> */}

          </div>
        </section>

        {/* Key Features */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Key Features</h2>
            <p className="text-gray-500 mb-12">
              Everything you need for a seamless rental experience
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={FaBagShopping}
                title="Centralized Platform"
                description="All-in-one clothing rental and donation platform."
                color="bg-purple-500"
              />
              <FeatureCard
                icon={FaClock}
                title="Real-time Availability"
                description="Instant booking with live clothing availability."
                color="bg-blue-500"
              />
              <FeatureCard
                icon={FaMapLocationDot}
                title="Google Maps Integration"
                description="Find nearby rental shops with easy navigation."
                color="bg-pink-500"
              />
              <FeatureCard
                icon={FaShield}
                title="Secure Payments"
                description="Safe and reliable transaction experience."
                color="bg-green-500"
              />
              <FeatureCard
                icon={FaLock}
                title="JWT Authentication"
                description="Protected user access and privacy."
                color="bg-yellow-500"
              />
              <FeatureCard
                icon={FaHeart}
                title="Donation Module"
                description="Support sustainable fashion through donations."
                color="bg-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Wardrobe?
            </h2>
            <p className="text-purple-100 mb-6">
              Join thousands of fashion-forward individuals who choose sustainable style.
            </p>
            <button className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100">
              Get Started Today
            </button>
          </div>
        </section>

        <Footer />

      </div>
    </>
  );
};

export default Landing;
