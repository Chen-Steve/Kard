import '../app/globals.css';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { FaArrowLeft } from 'react-icons/fa';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    } else if (data.user) {
      console.log('Account created successfully:', data.user);

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email, password }),
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
      }
    } else {
      console.error('User data is null');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center px-4">
      <div className="absolute top-20 left-20">
        <Link href="/">
          <FaArrowLeft className="text-white text-2xl" />
        </Link>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm border-4 border-black">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Join Kard</h1>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Account
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-sm text-white">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-blue-200 hover:text-blue-100">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;