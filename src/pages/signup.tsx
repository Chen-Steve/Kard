import '../app/globals.css';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { CgSpinner } from "react-icons/cg";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { Icon } from '@iconify/react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setPasswordsMatch(false);
      setLoading(false);
      return;
    }

    if (!hcaptchaToken) {
      setErrorMessage('Please complete the hCaptcha.');
      setLoading(false);
      return;
    }

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
      setLoading(false);
    } else if (data.user) {
      console.log('Account created successfully:', data.user);

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: data.user.id, email, password, name, hcaptchaToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response from API:', errorData);
          throw new Error('Failed to create user in database');
        }

        const result = await response.json();
        console.log('User created in database:', result);

        router.push('/dashboard');
      } catch (error: any) {
        console.error('Error creating user in database:', (error as Error).message);
        setErrorMessage('An error occurred while creating your account. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      console.error('User data is null');
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-center text-black mb-8">Join Kard</h1>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                required
                className="block px-3 py-2 w-full text-sm bg-gray-50 border border-gray-300 rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black
                           peer"
              />
              <label
                htmlFor="email"
                className="absolute text-sm text-gray-500 duration-300 transform 
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
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                required
                className="block px-3 py-2 w-full text-sm bg-gray-50 border border-gray-300 rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black
                           peer"
              />
              <label
                htmlFor="name"
                className="absolute text-sm text-gray-500 duration-300 transform 
                           -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-50 px-2 peer-focus:px-2 
                           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
                           peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 
                           peer-focus:scale-75 peer-focus:text-black left-1"
              >
                Name
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
                className="block px-3 py-2 w-full text-sm bg-gray-50 border border-gray-300 rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black
                           peer"
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 duration-300 transform 
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
            <PasswordStrengthMeter password={password} />

            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordsMatch(e.target.value === password);
                }}
                placeholder=" "
                required
                className={`block px-3 py-2 w-full text-sm bg-gray-50 border rounded-md 
                           appearance-none focus:outline-none focus:ring-1 focus:ring-black
                           peer ${!passwordsMatch ? 'border-red-500' : 'border-gray-300'}`}
              />
              <label
                htmlFor="confirmPassword"
                className="absolute text-sm text-gray-500 duration-300 transform 
                           -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-gray-50 px-2 peer-focus:px-2 
                           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
                           peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 
                           peer-focus:scale-75 peer-focus:text-black left-1"
              >
                Confirm Password
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
            {!passwordsMatch && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}

            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={(token) => setHcaptchaToken(token)}
            />
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-500"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm font-semibold text-black">
          Already have an account?{' '}
          <Link 
            href="/signin" 
            className="font-medium text-black underline hover:text-gray-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;