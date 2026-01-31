import React from 'react';
import { FaBell } from 'react-icons/fa';

const DashboardHeader = ({ userInfo, notificationCount }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/20 border-2 border-white shadow-lg group cursor-pointer">
                    {userInfo.profileImage ? (
                        <img src={userInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                            {userInfo.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="text-white">
                    <h1 className="text-2xl font-bold">Welcome back, {userInfo.fullName}</h1>
                    <div className="flex flex-col text-sm text-white/90">
                        <span>{userInfo.email}</span>
                        <span>{userInfo.phone}</span>
                        <span className="mt-1 font-semibold bg-white/20 w-fit px-2 py-0.5 rounded text-xs">Role: User</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-white hover:bg-white/20 rounded-lg relative">
                    <FaBell className="text-xl" />
                    {notificationCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DashboardHeader;
