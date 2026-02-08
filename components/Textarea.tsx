import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-300 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`shadow appearance-none border border-dark-bg-700 rounded w-full py-2 px-3 bg-dark-bg-800 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-gold-accent focus:border-transparent resize-y min-h-[120px] ${className}`}
        {...props}
      ></textarea>
    </div>
  );
};

export default Textarea;