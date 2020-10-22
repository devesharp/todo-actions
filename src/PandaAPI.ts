import Axios from 'axios'

export async function createPandaTask(taskReference: string, data: any) {
  return Axios.put('http://localhost:8000/backlogs', {
    name: data.name,
    description: data.description,
    project_hash: 'ds',
    bot_hash: data.hash,
    bot_task_reference: taskReference,
    tags: [
      {
        name: data.marker,
        color: data.marker === 'FIXME' ? 'de173a' : '000000',
      }
    ]
  }).then(res => {
    return res.data;
  }).catch(e => {
    return null;
  });
}

export async function getUncompletedTasks(project: string) {

  return Axios.post('http://localhost:8000/backlogs/uncompleted', {
    project_hash: 'ds',
  }).then(res => {
    return res.data.results;
  }).catch(e => {
    console.log(e);
    return null;
  });
}

export async function updatePandaTask(reference: string, data: any) {
  return Axios.put('http://localhost:8000/backlogs', {
    ...{bot_task_reference: reference},
    ...data
  }).then(res => {
    return res.data;
  }).catch(e => {
    return null;
  });
}
