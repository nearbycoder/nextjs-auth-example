import { getSession } from 'next-auth/client';
import { ApolloServer, gql } from 'apollo-server-micro';
import prisma from '/prisma/client';

const typeDefs = gql`
  type User {
    id: String
    email: String
  }

  type Query {
    viewer: User
  }
`;

const resolvers = {
  Query: {
    viewer(parent, args, context) {
      return context?.user;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const session = await getSession({ req });
    let user = null;

    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    return {
      user,
    };
  },
  playground: {
    settings: {
      'request.credentials': 'include',
    },
  },
});

const handler = server.createHandler({
  path: '/api/graphql',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
