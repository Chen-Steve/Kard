import '../app/globals.css';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { Icon } from '@iconify/react';
import { CgSpinner } from "react-icons/cg";
import ForgotPassword from '../components/forgotPassword';
import { updateStreak } from '../utils/streak';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Attempting to sign in...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign-in error:', error);
      setErrorMessage(error.message);
      setLoading(false);
    } else if (data.user) {
      console.log('User signed in successfully:', data.user);
      
      // Update last_login in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Error updating last login:', updateError);
      }

      // Update streak after successful login
      await updateStreak(data.user.id);
      console.log('Streak updated');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen dot-pattern flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <div className={`absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 ${loading ? '' : 'hidden'}`}>
        <CgSpinner className="animate-spin text-4xl text-black" />
      </div>
      <div className={`w-full ${loading ? 'blur-sm' : ''}`}>
        <div className="absolute top-4 left-4 sm:top-20 sm:left-40">
          <Link href="/">
            <Icon icon="pepicons-print:arrow-left" className="text-black text-4xl" />
          </Link>
        </div>
        <div className="p-8 rounded-lg w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Welcome Back!</h1>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="block px-3 py-2 w-full text-base bg-gray-50 border border-gray-300 rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black
                           peer"
              />
              <label
                htmlFor="email"
                className="absolute text-base text-gray-500 duration-300 transform 
                           -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-50 px-2 peer-focus:px-2 
                           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
                           peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 
                           peer-focus:scale-75 peer-focus:text-black left-1"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                className="block px-3 py-2 w-full text-base bg-gray-50 border border-gray-300 rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black
                           peer"
              />
              <label
                htmlFor="password"
                className="absolute text-base text-gray-500 duration-300 transform 
                           -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-50 px-2 peer-focus:px-2 
                           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
                           peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 
                           peer-focus:scale-75 peer-focus:text-black left-1"
              >
                Password
              </label>
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Icon icon="pepicons-print:eye" />
                ) : (
                  <Icon icon="pepicons-print:eye-closed" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotPasswordOpen(true);
                  }}
                  className="font-medium text-black underline hover:text-gray-800"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm font-semibold text-black mt-4">
          Don&apos;t have an account?{' '}
          <Link 
            href="/signup" 
            className="font-medium text-black underline hover:text-gray-800"
          >
            Sign up
          </Link>
        </p>
      </div>
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default SignIn;
