'use client';

import React, { useState } from 'react';

interface InfoCollapseProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  bgColor?: string;
}

export function InfoCollapse({ 
  title, 
  icon, 
  children, 
  defaultOpen = false, 
  bgColor = 'bg-white'
}: InfoCollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${bgColor} rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        style={{ background: 'linear-gradient(90deg, var(--primary), #055079)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-white mr-3 flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <div className="text-white flex-shrink-0">
            <svg 
              className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${
        isOpen 
          ? 'max-h-screen opacity-100 transform translate-y-0' 
          : 'max-h-0 opacity-0 transform -translate-y-2 overflow-hidden'
      }`}>
        <div className="p-6 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
