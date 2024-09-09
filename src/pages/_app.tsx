import { SessionProvider, useSession } from 'next-auth/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';
import '../lib/fontAwesome';
import { DragDropContext } from '@hello-pangea/dnd';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '../components/ui/toaster';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && router.pathname === '/') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return <>{children}</>;
}

function MyApp({ Component, pageProps: { session: initialSession, ...pageProps } }: AppProps) {
  const [isCursorInitialized, setIsCursorInitialized] = useState(false);

  const handleDragEnd = () => {
    // Handle the drag end event
  };

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Initialize iPad cursor
    if (typeof window !== 'undefined' && !isCursorInitialized) {
      import('ipad-cursor').then(({ initCursor }) => {
        initCursor();
        setIsCursorInitialized(true);
      });
    }

    // Clean up function
    return () => {
      if (isCursorInitialized && typeof window !== 'undefined') {
        import('ipad-cursor').then(({ disposeCursor }) => {
          disposeCursor();
        });
      }
    };
  }, [isCursorInitialized]);

  useEffect(() => {
    // Update cursor when the component re-renders
    if (typeof window !== 'undefined' && isCursorInitialized) {
      import('ipad-cursor').then(({ updateCursor }) => {
        updateCursor();
      });
    }
  });

  return (
    <>
      <Head>
        <title>Kard - A Better Quizlet Alternative</title>
        <link rel="icon" href="/blob.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionProvider session={initialSession}>
        <AuthWrapper>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Component {...pageProps} />
            <Analytics />
            <Toaster />
            <ToastContainer />
          </DragDropContext>
        </AuthWrapper>
      </SessionProvider>
    </>
  );
}

export default MyApp;
