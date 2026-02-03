import React from 'react';
import {
    FaSearch,
    FaBoxOpen,
    FaClipboardList,
    FaUserCheck,
    FaCheckCircle,
    FaTshirt
} from 'react-icons/fa';

const DonationSteps = () => {
    const steps = [
        {
            id: 1,
            title: "Browse Donation Option",
            description: "Explore available stores and choose where you'd like to contribute your clothes.",
            icon: <FaSearch className="text-purple-600" />,
        },
        {
            id: 2,
            title: "Prepare Clothing Item",
            description: "Ensure your clothes are clean, in good condition, and ready for their next adventure.",
            icon: <FaBoxOpen className="text-purple-600" />,
        },
        {
            id: 3,
            title: "Submit Donation Form",
            description: "Fill in the details about your item and upload a clear photo for review.",
            icon: <FaClipboardList className="text-purple-600" />,
        },
        {
            id: 4,
            title: "Store/Admin Reviews Item",
            description: "Our team or the store owner will carefully review your donation request.",
            icon: <FaUserCheck className="text-purple-600" />,
        },
        {
            id: 5,
            title: "Donation Approved",
            description: "Once approved, you'll receive a notification to drop off or ship your item.",
            icon: <FaCheckCircle className="text-purple-600" />,
        },
        {
            id: 6,
            title: "Item Added To Inventory",
            description: "Your item becomes part of our rental collection, promoting sustainable fashion!",
            icon: <FaTshirt className="text-purple-600" />,
        },
    ];

    return (
        <div className="py-12 bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="px-8 mb-10 overflow-hidden">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">How Donation Works</h2>
                <p className="text-gray-600">Follow these simple steps to give your clothes a second life.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
                {steps.map((step) => (
                    <div key={step.id} className="relative flex flex-col items-start p-6 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors group">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            {step.id}
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            {step.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DonationSteps;
