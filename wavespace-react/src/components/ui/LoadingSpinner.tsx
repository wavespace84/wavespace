interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'medium', 
  message,
  className = ''
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        animate-spin rounded-full border-2 border-gray-200 border-t-blue-600
      `} />
      {message && (
        <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};