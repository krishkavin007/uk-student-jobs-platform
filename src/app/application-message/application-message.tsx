'use client'

import React, { useRef, useEffect } from 'react';

interface Job {
  job_id: number;
  job_title: string;
  job_description: string;
  job_category: string;
  job_location: string;
  hourly_pay: string;
  hours_per_week: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  is_sponsored: boolean;
  posted_by_user_id: number;
  created_at: string;
  expires_at: string | null;
  job_status: string;
  application_count?: number;
  hoursType: string;
  applicationCount: number;
  employer: string;
  applicationUrl: string | null;
  postedDate: string;
  id: number;
  title: string;
  company: string;
  location: string;
  hourlyPay: string;
  hoursPerWeek: string;
  description: string;
  sponsored: boolean;
  category: string;
  phoneNumber: string;
}

interface ApplicationMessageModalProps {
  job: Job | null;
  message: string;
  onMessageChange: (message: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const ApplicationMessageModal: React.FC<ApplicationMessageModalProps> = ({ 
  job, 
  message, 
  onMessageChange, 
  onSubmit, 
  onClose, 
  isOpen 
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      // Restore body scrolling when modal closes
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[999] transition-opacity duration-300 p-2 sm:p-2" style={{ paddingTop: '80px' }}>
      <div ref={modalContentRef} className="bg-gray-900 p-3 sm:p-4 md:p-6 rounded-xl md:rounded-2xl shadow-3xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto relative flex flex-col h-[80vh] sm:h-[85vh] md:h-[80vh] lg:h-[75vh] max-h-[500px] sm:max-h-[650px] md:max-h-[700px] lg:max-h-[750px] overflow-hidden transition-all duration-300 transform scale-100 opacity-100">
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-90"
          aria-label="Close application message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-700 pr-6 sm:pr-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
            Apply for {job.job_title}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm md:text-base text-gray-300 flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400">
                <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 18.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-5.495-2.261A9.752 9.752 0 0 0 6 12a6 6 0 0 1 6-6h.75a.75.75 0 0 0 0-1.5H12a7.5 7.5 0 0 0-7.5 7.5c0 1.574.341 3.085.992 4.475C6.425 18.17 7.72 18.75 9 18.75h.75a.75.75 0 0 1 0 1.5H9c-1.802 0-3.52-.693-4.821-1.994A10.455 10.455 0 0 1 2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75a9.752 9.752 0 0 0-.992 4.475 7.472 7.472 0 0 1-1.282 1.832 7.5 7.5 0 0 0-6.177 1.62.75.75 0 0 1-.954-.937Z" clipRule="evenodd" />
              </svg>
              {job.contact_name}
            </span>
            <span className="text-xs sm:text-sm md:text-base text-gray-300 flex items-center gap-1 sm:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400">
                <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a8.75 8.75 0 0 0 4.721-6.786c1.294-4.507-1.697-9.078-6.75-9.078s-8.044 4.571-6.75 9.078a8.75 8.75 0 0 0 4.72 6.786ZM12 12.75a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
              </svg>
              {job.job_location}
            </span>
          </div>
          <div className="text-sm sm:text-base md:text-lg font-bold text-green-400">£{job.hourly_pay}<span className="text-xs sm:text-sm md:text-base font-medium">/hr</span></div>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
          <div className="mb-3 sm:mb-4">
            <label htmlFor="applicationMessage" className="block text-sm sm:text-base md:text-lg font-semibold text-white mb-1 sm:mb-2 md:mb-3">
              Your Application Message
            </label>
            <p className="text-gray-400 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm">
              Introduce yourself and explain why you're interested in this position. This message will be sent to the employer.
            </p>
            <textarea
              id="applicationMessage"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Hi! I'm interested in this position because... I have experience in... I'm available for... I'm excited about the opportunity to..."
              className="w-full h-40 sm:h-36 md:h-40 lg:h-44 xl:h-48 px-2 sm:px-3 md:px-4 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 transition-all duration-200 resize-none text-xs sm:text-sm md:text-base"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1 sm:mt-2">
              <span className="text-xs text-gray-400">
                {message.length}/1000 characters
              </span>
              <span className="text-xs text-gray-400">
                {message.length > 0 ? `${Math.ceil(message.length / 50)} sentences` : '0 sentences'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center sm:justify-start">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-gray-600 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 transition-all duration-200 active:scale-98 shadow-sm text-xs sm:text-sm md:text-base order-2 sm:order-1"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={!message.trim()}
            className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 active:scale-98 shadow-md text-xs sm:text-sm md:text-lg font-semibold order-1 sm:order-2 ${
              message.trim()
                ? 'bg-blue-700 text-white hover:bg-blue-800'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: Payment (£1)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationMessageModal; 