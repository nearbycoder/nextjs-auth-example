import { signIn, signOut, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { useQuery, gql, useMutation } from '@apollo/client';
import Task from '/components/Task';
import TaskForm from '/components/TaskForm';
import { useState } from 'react';

export const TASKS = gql`
  query Tasks {
    tasks {
      id
      name
      description
      completedAt
      createdAt
      updatedAt
      subtasks {
        id
        name
        description
        completedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export default function Page({ user }) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const { loading, error, data } = useQuery(TASKS);

  if (loading) return <div>Loading</div>;

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Tasks
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowNewTaskForm(true)}
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          New Task
        </button>
      </div>
      {showNewTaskForm && (
        <TaskForm
          title="New Task"
          closeNewTask={() => setShowNewTaskForm(false)}
          mutationKey="createTask"
        />
      )}
      <ul className="divide-y divide-gray-200 mt-4">
        {data.tasks.map((task) => {
          return <Task key={task.id} task={task} />;
        })}
      </ul>
    </div>
  );
}
