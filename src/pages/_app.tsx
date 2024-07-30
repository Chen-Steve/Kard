import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import '../app/globals.css';
import '../lib/fontAwesome';
import { DragDropContext } from '@hello-pangea/dnd';
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    hcaptchaOnLoad: () => void;
    hcaptcha: any;
    onError: (error: any) => void;
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const handleDragEnd = () => {
    // Handle the drag end event
  };

  useEffect(() => {
    window.hcaptchaOnLoad = () => {
      console.log('hCaptcha is ready.');
      if (window.hcaptcha) {
        window.hcaptcha.render('captcha-container', {
          sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
          size: 'compact',
          theme: 'light',
          'error-callback': window.onError,
        });
      }
    };

    window.onError = (error: any) => {
      console.error('hCaptcha error:', error);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Head>
          <title>My App</title>
        </Head>
        <Script
          src={`https://js.hcaptcha.com/1/api.js?onload=hcaptchaOnLoad&render=explicit&recaptchacompat=off`}
          strategy="afterInteractive"
        />
        <Component {...pageProps} />
        <Analytics />
      </DragDropContext>
    </SessionProvider>
  );
}

export default MyApp;
