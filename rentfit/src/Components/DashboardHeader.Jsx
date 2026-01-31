import React from 'react';
import { FaBell } from 'react-icons/fa';

const DashboardHeader = ({ userInfo, notificationCount }) => {
    const name = userInfo?.fullName || 'User';
    const email = userInfo?.email || '';
    const phone = userInfo?.phone || '';
    const image = userInfo?.profileImage;

    const renderAvatar = () => {
        if (image) {
            return (
                <img
                    src={image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            );
        }
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="bg-white border-b border-gray-200 mb-8 -mx-8 -mt-8">
            <div className="px-8 py-5 flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">User Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome back, {name}. Manage your rentals and explore new outfits.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaBell className="text-lg" />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-800">{name}</p>
                            <p className="text-xs text-gray-500">User</p>
                        </div>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 group cursor-pointer border border-gray-100 shadow-sm">
                            {renderAvatar()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;