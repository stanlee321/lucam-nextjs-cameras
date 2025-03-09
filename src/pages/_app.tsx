import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@/context/ThemeContext';
import AppLayout from '@/components/layout/AppLayout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Camera Administrator App</title>
        <meta name="description" content="Camera administration application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </ThemeProvider>
    </>
  );
} 