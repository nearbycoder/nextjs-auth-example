import { signIn, signOut, useSession } from 'next-auth/client';
import { useQuery, gql } from '@apollo/client';

const CURRENT_USER = gql`
  query CurrentUser {
    viewer {
      id
      email
    }
  }
`;

export default function Page() {
  const { loading, error, data } = useQuery(CURRENT_USER);

  if (loading) return <div>Loading</div>;

  return (
    <>
      {!data.viewer && (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
      {data.viewer && (
        <>
          Signed in as {data.viewer.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
}
