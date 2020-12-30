import { logger, invariant } from 'tkt'
import { ITodo, ITaskState } from './types'
import { ObjectId } from 'mongodb'

import { getMongoDb } from './MongoDB'
import { currentProcessId } from './ProcessId'
import { createPandaTask, getUncompletedTasks, updatePandaTask } from './PandaAPI'
import * as TaskInformationGenerator from './TaskInformationGenerator'

const log = logger('DataStore')

type TaskResolutionProcedure =
  | { existingTaskReference: string }
  | { acquireTaskCreationLock(): Promise<TaskCreationLock> }

type TaskCreationLock = {
  finish(taskReference: string, state: ITaskState): Promise<void>
}

type Task = {
  taskReference: string
  state: ITaskState
  hash?: string
  markAsCompleted(): Promise<void>
  updateState(newState: ITaskState, data: any): Promise<void>
}

export async function beginTaskResolution(
  todoUniqueKey: string,
  repositoryId: string,
  todo: ITodo,
): Promise<TaskResolutionProcedure> {
  const {
    title,
    body,
    state,
    marker
  } = TaskInformationGenerator.generateTaskInformationFromTodo(todo);

  const task = await createPandaTask(todoUniqueKey, {
    name: '[DS Bot] ' + title,
    description: body,
    hash: state.hash,
    category: todo.category,
    tags: todo.tags,
    marker,
  });

  // Erro ao criar task
  if (!task) {
    throw new Error('Failed to upsert a task.')
  }

  /**
   * Task já criada
   */
  if (!task.new) {
    log.debug(
      'Found already-existing identifier %s for TODO %s.',
      task.taskReference,
      todoUniqueKey,
    )
    return { existingTaskReference: task.taskReference }
  }

  return {
    async acquireTaskCreationLock() {
      return {
        async finish(taskReference, state) {
          // Associate
          log.debug(
            'Created task %s for TODO %s. Saving changes.',
            taskReference,
            todoUniqueKey,
          )
        },
      }
    },
  }
}

export async function findAllUncompletedTasks(
  repositoryId: string,
): Promise<Task[]> {
  let result = await getUncompletedTasks('bdi-api');

  return result.map((taskData: any) => {
    return {
      taskReference:
        taskData.taskReference ||
        invariant(false, 'Unexpected unassociated task.'),
      hash: taskData.hash,
      async markAsCompleted() {
        await updatePandaTask(taskData.taskReference, { status: 3 });
      },
      async updateState(newState, data: any) {
        await updatePandaTask(taskData.taskReference, data);
      },
    } as Task
  })
}
