import { ReactNode, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: ReactNode;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const Alert = ({ 
  type, 
  message, 
  onClose, 
  autoClose = false, 
  autoCloseTime = 5000 
}: AlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoClose) {
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, autoCloseTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, autoCloseTime, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const alertClasses = {
    base: "rounded-md p-4 mb-4 flex justify-between items-start",
    success: "bg-green-50 text-green-800 border border-green-200",
    error: "bg-red-50 text-red-800 border border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    info: "bg-blue-50 text-blue-800 border border-blue-200"
  };

  return (
    <div className={`${alertClasses.base} ${alertClasses[type]} animate-fadeIn`}>
      <div className="flex-1">{message}</div>
      <button 
        onClick={handleClose} 
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Alert;