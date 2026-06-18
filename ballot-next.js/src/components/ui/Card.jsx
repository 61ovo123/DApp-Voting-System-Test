import { forwardRef } from 'react';

const Card = forwardRef(({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${
        hover ? 'hover:shadow-md hover:border-gray-300 cursor-pointer transition-shadow' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export { Card };

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`px-4 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}