import '@/styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { createBrowserSupabaseClient, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<any, "public", any> | null>(null);
  
  useEffect(() => {
    setSupabaseClient(createBrowserSupabaseClient());
  }, []);
  
  if (!supabaseClient) {
    return <div>Loading...</div>;
  }

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <div className={inter.className}>
        <Toaster />
        <Component {...pageProps} />
      </div>
    </SessionContextProvider>
  );
}

export default appWithTranslation(App);
