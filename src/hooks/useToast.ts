import React from 'react';
import { toast } from 'react-toastify';
import { CustomToast } from '@/components/ui/custom-toast';

interface ToastOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useToast = () => {
  const showToast = ({ title, message, type = 'success' }: ToastOptions) => {
    const toastContent = React.createElement(CustomToast, {
      title,
      description: message,
      type
    });

    const options = { icon: false as const };

    switch (type) {
      case 'success':
        toast.success(toastContent, options);
        break;
      case 'error':
        toast.error(toastContent, options);
        break;
      case 'warning':
        toast.warn(toastContent, options);
        break;
      case 'info':
        toast.info(toastContent, options);
        break;
      default:
        toast(toastContent, options);
    }
  };

  return { showToast };
};

export default useToast;
