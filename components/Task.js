import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import TaskForm from './TaskForm';

const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Task({ task }) {
  const [deleteTask] = useMutation(DELETE_TASK);
  const [showEdit, setShowEdit] = useState(false);
  const [showUpdateTask, setShowUpdateTask] = useState(false);

  return (
    <li
      key={task.id}
      className="relative bg-white py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
      <div className="flex justify-between space-x-3">
        <div className="min-w-0 flex-1">
          <a href="#" className="block focus:outline-none">
            <p className="text-sm font-medium text-gray-900 truncate">
              {task.name}
            </p>
          </a>
        </div>
        <button
          type="button"
          onClick={() => setShowUpdateTask(!showUpdateTask)}
          className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Edit
        </button>
        <button
          onClick={() =>
            deleteTask({
              variables: { id: task.id },
              update: (cache) => {
                cache.modify({
                  fields: {
                    tasks(list, { readField }) {
                      return list.filter((n) => readField('id', n) !== task.id);
                    },
                  },
                });
              },
            })
          }
          type="button"
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          Delete
        </button>
      </div>
      <div className="mt-1">
        <p className="line-clamp-2 text-sm text-gray-600">{task.description}</p>
      </div>
      {showUpdateTask && (
        <TaskForm
          title=""
          task={task}
          closeNewTask={() => setShowUpdateTask(false)}
          mutationKey="updateTask"
        />
      )}
    </li>
  );
}
