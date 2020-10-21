import { runMain } from './TodoActionsMain'
import { resetMockWorld } from './__mocks__/World'
import sortBy from 'lodash.sortby'

// jest.mock('./DataStore')
jest.mock('./PandaAPI')
jest.mock('./CodeRepository')
jest.mock('./TaskManagementSystem')

it('save in panda TODO', async () => {
  const MARKER = 'TODO'
  const world = resetMockWorld()

  // Round 1: Arrange
  world.file(
    'main.js',
    `
      // ${MARKER}: Hello world
      // This is great!

      <!--
        - ${MARKER}:
        - Somebody once told me
        - the world is gonna roll me
        -->
    `,
  )

  // Round 1: Act
  await runMain();

  // Round 1: Assert commits
  expect(world.commits.length).toEqual(2)
  expect(world.commits[0].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[\\$\\w+\\]: Hello world`),
  )
  expect(world.commits[1].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[.*\\]: Hello world`),
  )
  expect(world.commits[1].message).toMatch(/Update TODO references: (.*),(.*)/)

  // Round 1: Assert tasks
  expect(world.tasks.length).toEqual(2)
  expect(sortBy(world.tasks.map(t => t.name))).toEqual([
    '[DS Bot] Hello world',
    '[DS Bot] Somebody once told me',
  ])

  // Idempotent check
  await runMain()
  expect(world.commits.length).toEqual(2)
  expect(world.tasks.length).toEqual(2)

  // Round 2: Arrange
  const task1 = world.tasks.find(t => t.name === '[DS Bot] Hello world')!
  const task2 = world.tasks.find(t => t.name === '[DS Bot] Somebody once told me')!
  world.file(
    'main.js',
    `
      <!--
        - ${MARKER} [${task2.taskReference}]:
        - Somebody once told me?
        - the world is gonna roll me
        -->
    `,
  )

  // Round 2: Act
  await runMain()

  // Round 2: Assert commits
  // No new commits expected
  expect(world.commits.length).toEqual(2)

  // Round 2: Assert tasks
  expect(!!task1.completed).toBe(true)
  expect(!!task2.completed).toBe(false)
  expect(task2.name).toBe('[DS Bot] Somebody once told me?')
})

it('save in panda FIXME', async () => {
  const MARKER = 'FIXME'
  const world = resetMockWorld()

  // Round 1: Arrange
  world.file(
    'main.js',
    `
      // ${MARKER}: Hello world
      // This is great!

      <!--
        - ${MARKER}:
        - Somebody once told me
        - the world is gonna roll me
        -->
    `,
  )

  // Round 1: Act
  await runMain();

  // Round 1: Assert commits
  expect(world.commits.length).toEqual(2)
  expect(world.commits[0].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[\\$\\w+\\]: Hello world`),
  )
  expect(world.commits[1].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[.*\\]: Hello world`),
  )
  expect(world.commits[1].message).toMatch(/Update TODO references: (.*),(.*)/)

  // Round 1: Assert tasks
  expect(world.tasks.length).toEqual(2)
  expect(sortBy(world.tasks.map(t => t.name))).toEqual([
    '[DS Bot] Hello world',
    '[DS Bot] Somebody once told me',
  ])

  // Idempotent check
  await runMain()
  expect(world.commits.length).toEqual(2)
  expect(world.tasks.length).toEqual(2)

  // Round 2: Arrange
  const task1 = world.tasks.find(t => t.name === '[DS Bot] Hello world')!
  const task2 = world.tasks.find(t => t.name === '[DS Bot] Somebody once told me')!
  world.file(
    'main.js',
    `
      <!--
        - ${MARKER} [${task2.taskReference}]:
        - Somebody once told me?
        - the world is gonna roll me
        -->
    `,
  )

  // Round 2: Act
  await runMain()

  // Round 2: Assert commits
  // No new commits expected
  expect(world.commits.length).toEqual(2)

  // Round 2: Assert tasks
  expect(!!task1.completed).toBe(true)
  expect(!!task2.completed).toBe(false)
  expect(task2.name).toBe('[DS Bot] Somebody once told me?')
})
