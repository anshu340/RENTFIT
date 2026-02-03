import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaInfoCircle, FaPaperPlane, FaCheckCircle, FaTshirt, FaUndoAlt } from 'react-icons/fa';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const AboutUs = () => {
    const steps = [
        {
            id: 1,
            title: "Browse Clothing",
            description: "Explore our curated collection of premium clothing from various store owners.",
            icon: <FaSearch className="w-8 h-8 text-purple-600" />,
        },
        {
            id: 2,
            title: "View Product Details",
            description: "Check availability, sizes, and detailed descriptions to find your perfect fit.",
            icon: <FaInfoCircle className="w-8 h-8 text-purple-600" />,
        },
        {
            id: 3,
            title: "Send Rental Request",
            description: "Select your desired rental dates and send a request to the store owner.",
            icon: <FaPaperPlane className="w-8 h-8 text-purple-600" />,
        },
        {
            id: 4,
            title: "Store Owner Approves",
            description: "The owner reviews and approves your request to confirm the rental.",
            icon: <FaCheckCircle className="w-8 h-8 text-purple-600" />,
        },
        {
            id: 5,
            title: "Receive & Wear",
            description: "Receive your items, enjoy your new look, and wear them for your special occasion.",
            icon: <FaTshirt className="w-8 h-8 text-purple-600" />,
        },
        {
            id: 6,
            title: "Return Item",
            description: "Simply return the clothing after your rental period is over.",
            icon: <FaUndoAlt className="w-8 h-8 text-purple-600" />,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-white py-20 px-6 md:px-16 text-center border-b border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Empowering Style, <span className="text-purple-600">Sustainably.</span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed mb-8">
                            RentFit is revolutionizing the way we experience fashion. We believe in a world where everyone can access premium styles without the environmental cost of traditional retail.
                        </p>
                        <Link
                            to="/browseClothes"
                            className="inline-block px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                        >
                            Start Browsing
                        </Link>
                    </div>
                </section>

                {/* Section 1: About RentFit */}
                <section className="py-20 px-6 md:px-16 bg-white">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is RentFit?</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    RentFit is a modern clothing rental platform designed to make fashion affordable and sustainable. We connect fashion-forward individuals with store owners, enabling a circular economy where clothes are shared and loved by many, rather than being discarded after a few wears.
                                </p>
                                <p>
                                    Our mission is to reduce textile waste and minimize the environmental impact of the fashion industry. By choosing to rent instead of buy, you are helping to decrease the demand for fast fashion and contributing to a greener planet.
                                </p>
                                <p>
                                    Whether it's for a wedding, a gala, or just a weekend getaway, RentFit gives you access to a dream closet without the commitment of ownership.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl bg-purple-50 flex items-center justify-center p-12">
                            {/* Visual representation could be an image or a stylish graphic */}
                            <div className="text-center">
                                <FaTshirt className="w-32 h-32 text-purple-200 mb-4 mx-auto" />
                                <p className="text-purple-800 font-medium italic text-xl">"Fashion is better when shared."</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: How It Works */}
                <section id="how-it-works" className="py-20 px-6 md:px-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Getting your next favorite outfit is simple. Follow our quick 6-step process to start your rental journey today.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {steps.map((step) => (
                                <div
                                    key={step.id}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center group"
                                >
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <span className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Step {step.id}</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sustainability Call to Action */}
                <section className="py-20 px-6 bg-purple-600 text-white text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6">Join the Sustainable Fashion Movement</h2>
                        <p className="text-purple-100 text-lg mb-10 leading-relaxed">
                            Every rental on RentFit helps reduce the carbon footprint of the fashion industry. Start your sustainable style journey today.
                        </p>
                        <Link
                            to="/userRegister"
                            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors"
                        >
                            Sign Up Now
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AboutUs;
