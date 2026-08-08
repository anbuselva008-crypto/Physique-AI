import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = 'px-6 py-3.5 text-base';

  const variantStyles = {
    primary:
      'bg-[#10B981] text-black hover:bg-[#059669] shadow-lg shadow-[#10B981]/10 font-bold',
    secondary:
      'bg-[#222222] text-white hover:bg-[#2e2e2e]',
    outline:
      'border border-[#222222] text-white hover:bg-[#111111] hover:border-[#333333]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {icon && <span className="mr-2.5 inline-flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
