import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Formik, Form, Field } from 'formik';
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

const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

const CreateTaskSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
});

function Task({ task }) {
  const [deleteTask] = useMutation(DELETE_TASK);
  const [showEdit, setShowEdit] = useState(false);
  const [updateTask] = useMutation(UPDATE_TASK);

  return (
    <li style={{ listStyle: 'none', margin: '0', padding: '0' }} key={task.id}>
      <h3>{task.name}</h3>
      <p>{task.description}</p>
      {showEdit && (
        <TaskForm
          mutation={updateTask}
          mutationKey="updateTask"
          edit
          setShowEdit={setShowEdit}
          task={task}
        />
      )}
      <button
        onClick={() => {
          setShowEdit(true);
        }}>
        Edit
      </button>
      <button
        onClick={() => {
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
          });
        }}>
        Delete
      </button>
    </li>
  );
}

function TaskForm({
  edit,
  setShowEdit,
  mutation,
  mutationKey,
  task = { name: '', description: '' },
}) {
  return (
    <Formik
      initialValues={task}
      validationSchema={CreateTaskSchema}
      onSubmit={async (values, { resetForm }) => {
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
      }}>
      {({ errors, touched }) => (
        <Form>
          <div>
            <Field name="name" />
          </div>
          {errors.name && touched.name ? <div>{errors.name}</div> : null}
          <div>
            <Field name="description" as="textarea" />
          </div>
          {errors.description && touched.description ? (
            <div>{errors.description}</div>
          ) : null}
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  );
}

export default function Page({ user }) {
  const { loading, error, data } = useQuery(TASKS);
  const [createTask] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: TASKS }],
  });

  if (loading) return <div>Loading</div>;

  return (
    <div style={{ padding: '20px' }}>
      Signed in as {user?.email} <br />
      <button onClick={() => signOut()}>Sign out</button>
      <ul style={{ listStyle: 'none', margin: '0', padding: '0' }}>
        {data.tasks.map((task) => {
          return <Task key={task.id} task={task} />;
        })}
      </ul>
      <h2>New Task</h2>
      <TaskForm mutation={createTask} mutationKey="createTask" />
    </div>
  );
}
