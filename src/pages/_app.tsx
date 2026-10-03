import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { PaintSplatterBorder } from '@/components/PaintDoodles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        <Head>
          <title>Picto Buzz | Multiplayer Drawing & Guessing Game</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        </Head>
        <div className="relative min-h-screen flex flex-col bg-chalk-bg">
          <PaintSplatterBorder />
          <div className="relative z-10 flex-1 flex flex-col">
            <Component {...pageProps} />
          </div>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}
