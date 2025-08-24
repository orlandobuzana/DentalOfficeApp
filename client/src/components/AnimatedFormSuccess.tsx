import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface AnimatedFormSuccessProps {
  show: boolean;
  title: string;
  description?: string;
  onComplete?: () => void;
}

export function AnimatedFormSuccess({ show, title, description, onComplete }: AnimatedFormSuccessProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after 3 seconds and call onComplete
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 fade-in-animate">
      <div className="bg-white rounded-lg p-6 shadow-xl success-animate max-w-sm mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}