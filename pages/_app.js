import '../styles/globals.css';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import ClientOnly from '../components/ClientOnly';

const client = new ApolloClient({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/api/graphql`,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <ClientOnly>
        <Component {...pageProps} />
      </ClientOnly>
    </ApolloProvider>
  );
}

export default MyApp;
