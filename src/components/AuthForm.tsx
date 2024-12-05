import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import supabase from '../lib/supabaseClient';
import { CgSpinner } from "react-icons/cg";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { Icon } from '@iconify/react';
import ForgotPassword from './forgotPassword';
import { updateStreak } from '../utils/streak';
import FormInput from './FormInput';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const router = useRouter();

  const isSignUp = mode === 'signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (isSignUp) {
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
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: data.user.id, email, password, name, hcaptchaToken }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error('Failed to create user in database');
          }

          router.push('/dashboard');
        } catch (error: any) {
          setErrorMessage('An error occurred while creating your account. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign-in error:', error);
        setErrorMessage(error.message);
        setLoading(false);
      } else if (data.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating last login:', updateError);
        }

        await updateStreak(data.user.id);
        router.push('/dashboard');
      }
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
          <h1 className="text-3xl font-bold text-center text-black mb-8">
            {isSignUp ? 'Join Kard' : 'Welcome Back!'}
          </h1>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              required
            />

            {isSignUp && (
              <FormInput
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Name"
                required
              />
            )}

            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              required
              showPasswordToggle
              onTogglePassword={() => setShowPassword(!showPassword)}
              showPassword={showPassword}
            />

            {isSignUp && (
              <>
                <PasswordStrengthMeter password={password} />
                <FormInput
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordsMatch(e.target.value === password);
                  }}
                  label="Confirm Password"
                  required
                  showPasswordToggle
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  showPassword={showPassword}
                  error={!passwordsMatch}
                />
                {!passwordsMatch && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
              </>
            )}

            {!isSignUp && (
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
            )}

            {isSignUp && (
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={(token) => setHcaptchaToken(token)}
              />
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-500"
              disabled={loading}
            >
              {loading
                ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
        <p className="text-center text-sm font-semibold text-black mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link 
            href={isSignUp ? '/signin' : '/signup'}
            className="font-medium text-black underline hover:text-gray-800"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </Link>
        </p>
      </div>
      {!isSignUp && (
        <ForgotPassword
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      )}
    </div>
  );
};

export default AuthForm; 