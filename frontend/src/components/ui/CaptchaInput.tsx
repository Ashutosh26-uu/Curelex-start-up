import React, { useState, useEffect } from 'react';

interface CaptchaInputProps {
  onCaptchaChange: (captchaId: string, captchaValue: string) => void;
  error?: string;
}

export const CaptchaInput: React.FC<CaptchaInputProps> = ({ onCaptchaChange, error }) => {
  const [captchaData, setCaptchaData] = useState<{ id: string; challenge: string } | null>(null);
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCaptcha = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/captcha');
      const data = await response.json();
      setCaptchaData(data);
      setCaptchaValue('');
      onCaptchaChange(data.id, '');
    } catch (error) {
      console.error('Failed to generate captcha:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleCaptchaChange = (value: string) => {
    setCaptchaValue(value);
    if (captchaData) {
      onCaptchaChange(captchaData.id, value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Security Verification
      </label>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1 flex items-center space-x-2">
          <div className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider text-center min-w-[120px] select-none">
            {loading ? '...' : captchaData?.challenge || 'Loading...'}
          </div>
          
          <button
            type="button"
            onClick={generateCaptcha}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh captcha"
          >
            🔄
          </button>
        </div>

        <div className="flex-1">
          <input
            type="text"
            value={captchaValue}
            onChange={(e) => handleCaptchaChange(e.target.value.toUpperCase())}
            placeholder="Enter code"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={10}
            autoComplete="off"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Enter the code shown above for security verification
      </p>
    </div>
  );
};