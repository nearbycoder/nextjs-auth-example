import { signIn, signOut, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Formik, Form, Field } from 'formik';
import Task from '/components/Task';
import { useState } from 'react';
import * as Yup from 'yup';

const TASKS = gql`
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

const CREATE_TASK = gql`
  mutation CreateTask($name: String!, $description: String!) {
    createTask(name: $name, description: $description) {
      id
      name
      description
      createdAt
      updatedAt
      completedAt
      subtasks {
        id
        name
      }
    }
  }
`;

const CreateTaskSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
});

function TaskForm({
  edit,
  setShowEdit,
  mutation,
  mutationKey,
  closeNewTask,
  task = { name: '', description: '' },
}) {
  return (
    <Formik
      initialValues={task}
      validationSchema={CreateTaskSchema}
      onSubmit={async (values, { resetForm }) => {
        console.log(values);
        let updatedTask;
        if (task.id) {
          updatedTask = await mutation({
            variables: { id: task.id, ...values },
          });
        } else {
          updatedTask = await mutation({ variables: values });
        }

        if (updatedTask?.data?.[mutationKey]?.id) {
          resetForm();
        }
        if (edit) {
          setShowEdit(false);
        }
        if (mutationKey === 'createTask') {
          closeNewTask();
        }
      }}>
      {({ errors, touched }) => (
        <Form>
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 pt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                New Task
              </h3>
              <p className="mt-1 text-sm text-gray-500">Creating a new task</p>
            </div>
            <div className="px-4 bg-white space-y-6 sm:p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                      placeholder="Task"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="All is great"
                    defaultValue={''}
                  />
                </div>
              </div>
            </div>
            <div className="px-4 pb-3 text-right sm:px-6">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Save
              </button>
            </div>
          </div>
          {errors.name && touched.name ? <div>{errors.name}</div> : null}

          {errors.description && touched.description ? (
            <div>{errors.description}</div>
          ) : null}
        </Form>
      )}
    </Formik>
  );
}

export default function Page({ user }) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const { loading, error, data } = useQuery(TASKS);
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: TASKS }],
  });

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
          closeNewTask={() => setShowNewTaskForm(false)}
          mutation={createTask}
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
