import { useState } from 'react';
import { Icon } from '@iconify/react';

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      setMessage('Password reset email sent. Please check your inbox or spam folder for further instructions.');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <div className="w-full max-w-xs bg-white rounded-lg">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <h2 className="text-base font-medium">Reset Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <Icon icon="mdi:close" width="18" height="18" />
          </button>
        </div>
        
        <form onSubmit={handleRequestReset} className="p-3">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-gray-50 border rounded text-sm
                     focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Enter your email"
            required
          />
          
          {message && (
            <p className={`mt-2 text-xs ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-1.5 bg-black text-white text-sm font-medium rounded
                     hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;