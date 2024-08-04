import '../app/globals.css';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Set loading state

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error creating account:', (error as Error).message);
      if ((error as any).status === 429) {
        setErrorMessage('Too many requests. Please try again later.');
      } else {
        setErrorMessage((error as Error).message);
      }
      setLoading(false); // Reset loading state
    } else if (data.user) {
      console.log('Account created successfully:', data.user);

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email, password, rememberMe }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response from API:', errorData);
          throw new Error('Failed to create user in database');
        }

        const result = await response.json();
        console.log('User created in database:', result);

        router.push('/dashboard');
      } catch (error) {
        console.error('Error creating user in database:', (error as Error).message);
        setErrorMessage('An error occurred while creating your account. Please try again.');
        setLoading(false); // Reset loading state
      }
    } else {
      console.error('User data is null');
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-white flex flex-col items-center justify-center px-4">
      <div className="absolute top-20 left-20">
        <Link href="/">
          <FaArrowLeft className="text-white text-2xl" />
        </Link>
      </div>
      <div className="p-8 rounded-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-black mb-8">Join Kard</h1>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                           focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="••••••••"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-black">
              Remember me for 30 days
            </label>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-sm font-semibold text-black">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-black underline hover:text-gray-800">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;