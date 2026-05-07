import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', animate = true }) => {
  return (
    <div className={`glass p-6 rounded-3xl ${animate ? 'animate-fade-in' : ''} ${className}`}>
      {children}
    </div>
  );
};
