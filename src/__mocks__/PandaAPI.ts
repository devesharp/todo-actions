import { ObjectId } from 'mongodb'
import { mockWorld } from './World'

// const tasks: any = [];

export async function createPandaTask(taskReference: string, data: any) {
  const _id = ObjectId.createFromHexString(taskReference);

  let task = {
    id: _id,
    taskReference: taskReference,
    name: data.name,
    tags: data.tags ?? [],
    category: data.category ?? null,
    description: data.description ?? '',
    hash: data.hash,
    new: true,
  };


  mockWorld.tasks.push(task);

  return Promise.resolve(task)
}

export async function getUncompletedTasks(project: string) {
  // string
  return Promise.resolve(mockWorld.tasks);
}

export async function updatePandaTask(reference: string, data: any) {
  let task = getTask(reference);

  data.completed = data.status === 3;
  data.tags = data.tags ?? [];
  data.category = data.category ?? null;

  Object.assign(getTask(reference), {...getTask(reference), ...data});

  return Promise.resolve(getTask(reference));
}


/**
 * Mock
 */
function getTask(taskReference: string) {
  return mockWorld.tasks.find(t => t.taskReference === taskReference)!
}
