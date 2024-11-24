import { SessionProvider, useSession } from 'next-auth/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../app/globals.css';
import { DragDropContext } from '@hello-pangea/dnd';
import { Analytics } from '@vercel/analytics/react';

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
  const handleDragEnd = () => {
    // Handle the drag end event
  };

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <>
      <Head>
        <title>Kard</title>
        <link rel="icon" href="/blob.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Kard is a modern, user-friendly alternative to Quizlet. Create, study, and share flashcards with an uncomplicated and fast learning platform designed for everyone." />
      </Head>
      <SessionProvider session={initialSession}>
        <AuthWrapper>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Component {...pageProps} />
            <Analytics />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#000',
                },
                success: {
                  style: {
                    background: '#fff',
                  },
                },
                error: {
                  style: {
                    background: '#fff',
                  },
                },
              }}
            />
          </DragDropContext>
        </AuthWrapper>
      </SessionProvider>
    </>
  );
}

export default MyApp;
