import React from 'react';

const Profile: React.FC = () => {
    return (
        <div className="p-6">
            <header className="mb-8 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"></div>
                <h1 className="text-2xl font-bold text-gray-900">Alex Doe</h1>
                <p className="text-gray-500">Senior Frontend Engineer</p>
            </header>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
                <button className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors">
                    Account Settings
                </button>
                <button className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors">
                    Notifications
                </button>
                <button className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors">
                    Help & Support
                </button>
                <button className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors text-red-500">
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Profile;
