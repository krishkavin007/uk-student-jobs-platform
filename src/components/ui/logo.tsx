import React from 'react'

interface LogoProps {
  className?: string;
  variant?: 'default' | 'admin-dark';
}

export function Logo({ className = "", variant = 'default' }: LogoProps) {
  const iconColor = variant === 'admin-dark' ? 'text-white' : 'text-blue-600';
  const textColor = variant === 'admin-dark' ? 'text-white' : 'text-slate-900 dark:text-white';
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconColor}
        >
          <path
            d="M26 10H22V8C22 6.34 20.66 5 19 5H13C11.34 5 10 6.34 10 8V10H6C4.34 10 3 11.34 3 13V24C3 25.66 4.34 27 6 27H26C27.66 27 29 25.66 29 24V13C29 11.34 27.66 10 26 10ZM12 8C12 7.45 12.45 7 13 7H19C19.55 7 20 7.45 20 8V10H12V8ZM27 24C27 24.55 26.55 25 26 25H6C5.45 25 5 24.55 5 24V18H13V20C13 20.55 13.45 21 14 21H18C18.55 21 19 20.55 19 20V18H27V24ZM27 16H19V18H13V16H5V13C5 12.45 5.45 12 6 12H26C26.55 12 27 12.45 27 13V16Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <span className={`font-bold text-xl ${textColor}`}>
        StudentJobs UK
      </span>
    </div>
  )
}