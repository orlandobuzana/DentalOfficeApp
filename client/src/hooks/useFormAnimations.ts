import { useEffect } from 'react';

interface UseFormAnimationsProps {
  errors?: Record<string, any>;
  isSuccess?: boolean;
  isPending?: boolean;
}

export function useFormAnimations({ errors, isSuccess, isPending }: UseFormAnimationsProps) {
  // Add shake animation to form fields with errors
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorElements = document.querySelectorAll('[data-error="true"]');
      errorElements.forEach((element) => {
        element.classList.add('form-error-animate');
        // Remove animation class after animation completes
        setTimeout(() => {
          element.classList.remove('form-error-animate');
        }, 500);
      });
    }
  }, [errors]);

  // Add success animation to form
  useEffect(() => {
    if (isSuccess) {
      const formElement = document.querySelector('[data-success-target="true"]');
      if (formElement) {
        formElement.classList.add('success-animate');
        setTimeout(() => {
          formElement.classList.remove('success-animate');
        }, 600);
      }
    }
  }, [isSuccess]);

  // Add loading animation
  useEffect(() => {
    if (isPending) {
      const loadingElements = document.querySelectorAll('[data-loading-target="true"]');
      loadingElements.forEach((element) => {
        element.classList.add('loading-animate');
      });
    } else {
      const loadingElements = document.querySelectorAll('[data-loading-target="true"]');
      loadingElements.forEach((element) => {
        element.classList.remove('loading-animate');
      });
    }
  }, [isPending]);

  return {
    // Helper function to get form field classes
    getFieldClasses: (fieldName: string, hasError?: boolean) => {
      const baseClasses = 'form-field-animate focus-ring-animate';
      const errorClasses = hasError ? 'form-error-animate' : '';
      return `${baseClasses} ${errorClasses}`.trim();
    },
    
    // Helper function to get button classes
    getButtonClasses: (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
      const baseClasses = 'button-animate';
      const variantClasses = {
        primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
        secondary: 'bg-gray-200 hover:bg-gray-300',
        outline: 'border border-gray-300 hover:bg-gray-50'
      };
      
      return `${baseClasses} ${variantClasses[variant]}`.trim();
    }
  };
}