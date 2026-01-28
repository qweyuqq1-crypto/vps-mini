
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center group">
            <div className="bg-orange-500 p-2.5 rounded-xl shadow-lg shadow-orange-200 transition group-hover:scale-105">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 11c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 1.298.617 2.452 1.58 3.19C7.412 15.222 6 17.447 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.553-1.412-4.778-3.58-5.81.963-.738 1.58-1.892 1.58-3.19z" />
                <path d="M12 7V3l-2 1.5L12 6l2-1.5L12 3v4zM10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              </svg>
            </div>
            <span className="ml-4 text-2xl font-black text-gray-900 tracking-tight">
              mini <span className="text-orange-600">Panel</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              极简管理模式
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
