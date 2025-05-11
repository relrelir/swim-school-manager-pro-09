
import React, { useRef, useEffect, useState } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from '@/components/ui/button';
import { PenIcon, RotateCcwIcon, CheckIcon } from 'lucide-react';

interface SignaturePadProps {
  onSignatureConfirm: (signatureData: string) => void;
  onCancel: () => void;
}

const SignaturePadComponent: React.FC<SignaturePadProps> = ({ 
  onSignatureConfirm,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set canvas dimensions based on container size
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = Math.min(container.clientWidth * 0.6, 300); // Adjust height based on width
    }
    
    // Initialize signature pad with improved options
    const pad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      penColor: 'black',
      minWidth: 1,
      maxWidth: 2.5,
      velocityFilterWeight: 0.7 // Smoother lines
    });
    
    setSignaturePad(pad);
    
    // Cleanup function
    return () => {
      if (pad) {
        pad.off();
      }
    };
  }, [canvasRef]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !signaturePad) return;
      
      // Save current data
      const data = signaturePad.toData();
      
      // Resize canvas
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = Math.min(container.clientWidth * 0.6, 300);
      }
      
      // Re-initialize signature pad
      signaturePad.clear();
      
      // Restore saved data if any
      if (data.length) {
        signaturePad.fromData(data);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [signaturePad]);

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
      setError(null);
    }
  };

  const confirmSignature = () => {
    if (isSubmitting) return;
    
    if (!signaturePad) {
      setError('שגיאה בטעינת שדה החתימה');
      return;
    }
    
    if (signaturePad.isEmpty()) {
      setError('יש להוסיף חתימה לפני האישור');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Get signature as data URL with better quality
      const dataUrl = signaturePad.toDataURL('image/png');
      onSignatureConfirm(dataUrl);
    } catch (err) {
      console.error('Error processing signature:', err);
      setError('אירעה שגיאה בעיבוד החתימה');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-medium mb-4">נא להוסיף את חתימתך:</div>
      
      <div className="w-full border-2 border-gray-300 rounded-md bg-white mb-4">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ 
            touchAction: 'none', 
            cursor: 'crosshair' 
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      
      <div className="flex flex-row space-x-4 space-x-reverse rtl:space-x-reverse justify-center w-full mb-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={clearSignature}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <RotateCcwIcon className="h-4 w-4 ml-2" />
          נקה חתימה
        </Button>
        
        <Button 
          type="button" 
          variant="default" 
          onClick={confirmSignature}
          disabled={isSubmitting}
          className="flex items-center"
        >
          <CheckIcon className="h-4 w-4 ml-2" />
          {isSubmitting ? 'מאשר...' : 'אשר חתימה'}
        </Button>
      </div>
      
      <div className="flex flex-row justify-center w-full">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          חזור לטופס
        </Button>
      </div>
      
      <div className="text-gray-500 text-sm mt-4 flex items-center">
        <PenIcon className="h-4 w-4 ml-2" />
        ניתן לחתום באמצעות העכבר או מסך מגע
      </div>
    </div>
  );
};

export default SignaturePadComponent;
