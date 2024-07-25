// src/pages/signup.tsx
import '../app/globals.css';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';

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
      console.error('Error creating account:', error.message);
      if (error.status === 429) {
        setErrorMessage('Too many requests. Please try again later.');
      } else {
        setErrorMessage(error.message);
      }
    } else {
      console.log('Account created successfully:', data.user);
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mt-4">Create Account</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="px-4 py-2 rounded-md"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="px-4 py-2 rounded-md"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Account
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{' '}
        <Link href="/signin" legacyBehavior>
          <a className="text-blue-500 hover:underline">Log in!</a>
        </Link>
      </p>
    </div>
  );
};

export default SignUp;