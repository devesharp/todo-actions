import { ObjectId } from 'mongodb'

const tasks: any = [];

export async function createPandaTask(taskReference: string, data: any) {
  const _id = ObjectId.createFromHexString(taskReference);

  let task = {
    id: _id,
    taskReference: taskReference,
    hash: data.hash,
    new: true,
  };

  tasks.push(task);

  return Promise.resolve(task)
}

export async function getUncompletedTasks(project: string) {
  // string
  return Promise.resolve(tasks);
}

export async function updatePandaTask(reference: string, data: any) {
  return Promise.resolve({});
}
