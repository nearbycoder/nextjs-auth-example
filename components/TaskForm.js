import { Formik, Form, Field } from 'formik';
import { XIcon } from '@heroicons/react/outline';
import { gql, useMutation } from '@apollo/client';
import * as Yup from 'yup';
import { TASKS } from '/pages/index';

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

const UPDATE_TASK = gql`
  mutation UpdateTask($id: String!, $name: String!, $description: String!) {
    updateTask(id: $id, name: $name, description: $description) {
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

export default function TaskForm({
  mutationKey,
  closeNewTask,
  title,
  task = { name: '', description: '' },
}) {
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: TASKS }],
  });
  const [updateTask] = useMutation(UPDATE_TASK);

  return (
    <Formik
      initialValues={task}
      validationSchema={CreateTaskSchema}
      onSubmit={async (values, { resetForm }) => {
        let updatedTask;
        if (mutationKey === 'updateTask') {
          updatedTask = await updateTask({
            variables: { id: task.id, ...values },
          });
        } else {
          updatedTask = await createTask({ variables: values });
        }

        if (updatedTask?.data?.[mutationKey]?.id) {
          resetForm();
          closeNewTask();
        }
      }}>
      {({ errors, touched, resetForm }) => (
        <Form>
          <div className="shadow sm:rounded-md sm:overflow-hidden mt-2 bg-white">
            {title && (
              <div className="flex justify-between">
                <div className="px-4 pt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Creating a new task
                  </p>
                </div>
                <div className="px-4 pt-5">
                  <button
                    onClick={() => {
                      closeNewTask();
                      resetForm();
                    }}
                    type="button"
                    className="inline-flex items-center px-1 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <XIcon
                      className="h-6 w-6 text-gray-700"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            )}
            <div className="px-4 bg-white space-y-6 p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700">
                    Name{' '}
                    {errors.name && touched.name ? (
                      <span className="text-sm text-red-600">
                        {errors.name}
                      </span>
                    ) : null}
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
                  Description{' '}
                  {errors.description && touched.description ? (
                    <span className="text-sm text-red-600">
                      {errors.description}
                    </span>
                  ) : null}
                </label>
                <div className="mt-1">
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="All is great"
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
        </Form>
      )}
    </Formik>
  );
}
