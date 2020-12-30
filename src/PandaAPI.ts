import Axios from 'axios'
// import { mockWorld } from './__mocks__/World'

export async function createPandaTask(taskReference: string, data: any) {
  return Axios.put('http://localhost:8000/api/public/backlogs', {
    name: data.name,
    description: data.description,
    project_key: 'ds',
    todo_task_reference: taskReference,
    tags: [
      {
        name: data.marker,
        color: data.marker === 'FIXME' ? 'de173a' : '000000',
      }
    ]
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

  return Axios.post('http://localhost:8000/api/public/backlogs/uncompleted', {
    project_key: 'ds',
  }).then(res => {
    return res.data.data.results;
  }).catch(e => {
    console.error(e.response.data);
    return null;
  });
}

export async function updatePandaTask(reference: string, data: any) {
  return Axios.put('http://localhost:8000/api/public/backlogs', {
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
