import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../app/globals.css';
import '../lib/fontAwesome';
import { DragDropContext } from '@hello-pangea/dnd';
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const handleDragEnd = () => {
    // Handle the drag end event
  };

  return (
    <SessionProvider session={session}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Component {...pageProps} />
        <Analytics />
        <ToastContainer />
      </DragDropContext>
    </SessionProvider>
  );
}

export default MyApp;