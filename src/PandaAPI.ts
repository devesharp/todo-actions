import Axios from 'axios'
// import { mockWorld } from './__mocks__/World'

export async function createPandaTask(taskReference: string, data: any) {
  return Axios.put(process.env.PANDA_API + '/api/public/backlogs', {
    name: data.name,
    description: data.description,
    tags: data.tags,
    category: data.category,
    project_key: process.env.PROJECT_KEY,
    todo_task_reference: taskReference
  }).then(res => {
    // // Apenas para testes
    // mockWorld.tasks.push(res.data.data);

    return res.data.data;
  }).catch(e => {
    console.error(e.response.data);
    return null;
  });
}

export async function getUncompletedTasks(project: string) {

  return Axios.post(process.env.PANDA_API + '/api/public/backlogs/uncompleted', {
    project_key: process.env.PROJECT_KEY,
  }).then(res => {
    return res.data.data.results;
  }).catch(e => {
    console.error(e.response.data);
    return null;
  });
}

export async function updatePandaTask(reference: string, data: any) {
  return Axios.put(process.env.PANDA_API + '/api/public/backlogs', {
    ...{todo_task_reference: reference},
    ...data
  }).then(res => {

    // // Apenas para testes
    // mockWorld.tasks.forEach((task, i) => {
    //   if(task.todo_task_reference === reference) {
    //     Object.assign(task, res.data.data);
    //   }
    // });

    return res.data.data;
  }).catch(e => {
    console.error(e.response.data);
    return null;
  });
}
