import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import '../app/globals.css';
import '../lib/fontAwesome';
import { DragDropContext } from '@hello-pangea/dnd';
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const handleDragEnd = () => {
    // Handle the drag end event
  };

  const hcaptchaOnLoad = () => {
    console.log('hCaptcha is ready.');
  };

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
