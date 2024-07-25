// src/pages/_app.tsx
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import '../app/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
