import '../styles/globals.css';
import { useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import ClientOnly from '../components/ClientOnly';

const client = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/api/graphql`,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  const [session, loading] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!(session || loading)) {
      router.push('/api/auth/signin');
    }
  }, [session, loading, router]);

  if (loading || !session) return null;

  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <Component user={session} {...pageProps} />
      </ClientOnly>
    </ApolloProvider>
  );
}

export default MyApp;
