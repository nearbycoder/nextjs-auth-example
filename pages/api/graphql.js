import { getSession } from 'next-auth/client';
import { ApolloServer, gql, UserInputError } from 'apollo-server-micro';
import prisma from '/prisma/client';
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value; // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    return new Date(ast.value);
  },
});

const typeDefs = gql`
  scalar Date

  type Subtask {
    id: String
    name: String
    description: String
    completedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type Task {
    id: String
    name: String
    user: User
    description: String
    subtasks: [Subtask]
    completedAt: Date
    createdAt: Date
    updatedAt: Date
  }

  type User {
    id: String
    email: String
    tasks: [Task]
  }

  type Mutation {
    createTask(name: String!, description: String!): Task
    updateTask(
      id: String!
      name: String
      description: String
      completedAt: Date
    ): Task
    deleteTask(id: String!): Task
    createSubtask(name: String!, description: String!, taskId: String!): Subtask
  }

  type Query {
    viewer: User
  }
`;

const resolvers = {
  Mutation: {
    createTask(parent, args, context) {
      return context.prisma.task.create({
        data: {
          userId: context?.user.id,
          ...args,
        },
      });
    },
    async updateTask(parent, { id, ...args }, context) {
      const task = await prisma.task.findUnique({
        where: {
          id,
        },
      });

      if (!task) {
        throw new UserInputError('Record Not Found');
      }
      if (task.userId !== context?.user?.id) {
        throw new UserInputError('Unauthorized');
      }

      return context.prisma.task.update({
        where: {
          id,
        },
        data: {
          ...args,
        },
      });
    },
    async deleteTask(parent, { id }, context) {
      const task = await prisma.task.findUnique({
        where: {
          id,
        },
      });

      if (!task) {
        throw new UserInputError('Record Not Found');
      }
      if (task.userId !== context?.user?.id) {
        throw new UserInputError('Unauthorized');
      }

      const deleteSubtasks = context.prisma.subtask.deleteMany({
        where: {
          taskId: id,
        },
      });

      const deleteTask = context.prisma.task.delete({
        where: {
          id,
        },
      });

      return prisma.$transaction([deleteSubtasks, deleteTask]);
    },
    async createSubtask(parent, { taskId, ...args }, context) {
      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
      });

      if (!task) {
        throw new UserInputError('Record Not Found');
      }
      if (task.userId !== context?.user?.id) {
        throw new UserInputError('Unauthorized');
      }

      return context.prisma.subtask.create({
        data: {
          taskId,
          ...args,
        },
      });
    },
  },
  Query: {
    viewer(parent, args, context) {
      return context?.user;
    },
  },
  User: {
    async tasks(parent, args, context) {
      return context.prisma.user
        .findUnique({
          where: { id: parent?.id },
        })
        .tasks();
    },
  },
  Task: {
    async subtasks(parent, args, context) {
      return context.prisma.task
        .findUnique({
          where: { id: parent?.id },
        })
        .subtasks();
    },
  },
  Date: dateScalar,
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
      prisma,
    };
  },
  playground:
    process.env.NODE_ENV === 'production'
      ? false
      : {
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
