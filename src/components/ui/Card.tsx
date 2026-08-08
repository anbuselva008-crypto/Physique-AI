import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[#111111] border border-[#222222] rounded-[32px] p-6 sm:p-8 transition-all duration-200 ${
        hoverable ? 'hover:border-[#333333] hover:bg-[#131313]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
