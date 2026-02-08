import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = 'font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';

  const variantStyles = {
    primary: 'bg-gold-accent text-dark-bg-950 hover:bg-light-gold focus:ring-gold-accent',
    secondary: 'bg-dark-bg-700 text-gray-100 hover:bg-dark-bg-800 focus:ring-gray-400',
    outline: 'border-2 border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-dark-bg-950 focus:ring-gold-accent',
  };

  const sizeStyles = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;