// src/pages/signin.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error.message);
    } else {
      console.log('Signed in successfully:', data);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mt-4">Sign In</h1>
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
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;