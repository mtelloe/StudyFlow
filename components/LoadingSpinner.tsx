import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-accent"></div>
      <p className="ml-3 text-gold-accent">Generando...</p>
    </div>
  );
};

export default LoadingSpinner;