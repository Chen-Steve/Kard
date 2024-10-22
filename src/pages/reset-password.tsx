import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { token, email } = router.query;
    
    if (!token || !email) {
      setError('Invalid or missing reset token or email');
      return;
    }

    const verifyToken = async () => {
      try {
        // First, try to verify the OTP
        const { error } = await supabase.auth.verifyOtp({
          token: token as string,
          type: 'recovery',
          email: email as string
        });

        if (error) {
          // If verification fails, try to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;

          // After refreshing, try to verify the OTP again
          const { error: secondVerifyError } = await supabase.auth.verifyOtp({
            token: token as string,
            type: 'recovery',
            email: email as string
          });
          if (secondVerifyError) throw secondVerifyError;
        }

        setIsValidToken(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            setError('Reset token has expired. Please request a new password reset.');
          } else if (error.message.includes('invalid')) {
            setError('Invalid reset token. Please check your reset link or request a new one.');
          } else {
            setError(`An error occurred: ${error.message}`);
          }
        } else {
          setError('An unknown error occurred while verifying the reset token.');
        }
      }
    };

    verifyToken();
  }, [router]);

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {error || 'Invalid reset token'}
          </h2>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword
      });
      
      if (error) throw error;
      
      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => router.push('/signin'), 3000);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while resetting the password');
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        {message && <p className="text-green-500 text-center">{message}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="new-password" className="sr-only">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type={showNewPassword ? "text" : "password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleNewPasswordVisibility}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
