import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import { createBrowserSupabaseClient, SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
  const queryClient = new QueryClient();
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<any, "public", any> | null>(null);
  
  useEffect(() => {
    setSupabaseClient(createBrowserSupabaseClient());
  }, []);
  
  if (!supabaseClient) {
    return <div>Loading...</div>;
  }

  return (
    
    <div className={inter.className}>
          <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
      </SessionContextProvider>
    </div>
  );
}

export default appWithTranslation(App);
