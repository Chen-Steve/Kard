import { SessionProvider, useSession } from 'next-auth/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';
import '../lib/fontAwesome';
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

  return (
    <SessionProvider session={initialSession}>
      <AuthWrapper>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Component {...pageProps} />
          <Analytics />
          <ToastContainer />
        </DragDropContext>
      </AuthWrapper>
    </SessionProvider>
  );
}

export default MyApp;