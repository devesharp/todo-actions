import { existsSync, readFileSync } from 'fs'
import { logger, invariant } from 'tkt'
import { execSync, execFileSync } from 'child_process'
import { IFile } from './types'
import { File } from './File'
import { Logger } from 'mongodb'

const log = logger('CodeRepository')

const event =
  process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH)
    ? (log.debug('Found GitHub Action event file'),
      JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')))
    : (log.debug('No GitHub Action event file found'), null)

export const repoContext = {
  repositoryNodeId:
    process.env.GITHUB_REPO_NODE_ID ||
    (event && event.repository && event.repository.node_id) ||
    invariant(
      false,
      'GitHub Repo Node ID not found, either in GitHub Action event payload and GITHUB_REPO_NODE_ID environment variable.',
    ),
  repositoryOwner:
    process.env.GITHUB_REPO_OWNER ||
    (event && event.repository && event.repository.full_name.split('/')[0]) ||
    invariant(
      false,
      'GitHub Repo Owner not found, either in GitHub Action event payload and GITHUB_REPO_OWNER environment variable.',
    ),
  repositoryName:
    process.env.GITHUB_REPO_NAME ||
    (event && event.repository && event.repository.full_name.split('/')[1]) ||
    invariant(
      false,
      'GitHub Repo Name not found, either in GitHub Action event payload and GITHUB_REPO_NAME environment variable.',
    ),
  defaultBranch:
    process.env.GITHUB_REPO_DEFAULT_BRANCH ||
    (event && event.repository && event.repository.default_branch) ||
    invariant(
      false,
      'GitHub Repo Default Branch not found, either in GitHub Action event payload and GITHUB_REPO_DEFAULT_BRANCH environment variable.',
    ),
}

type CodeRepositoryState = {
  files: IFile[]
  saveChanges(commitMessage: string): Promise<void>
}

export async function scanCodeRepository(): Promise<CodeRepositoryState> {
  log.info('Search for files with TODO tags...')
  let filesWithTodoMarker: any[] = [];
  try {
    filesWithTodoMarker = execSync('git grep -Il TODO', {
      encoding: 'utf8',
    }).split('\n')
      .filter(name => name)
  } catch (e) {
  }

  let filesWithFIXMEMarker: any[] = [];
  try {
    filesWithFIXMEMarker = execSync('git grep -Il FIXME', {
      encoding: 'utf8',
    }).split('\n')
      .filter(name => name)
  } catch (e) {
  }
  console.log(files);
  const files: IFile[] = []
  log.info('Parsing TODO tags...')
  for (const filePath of filesWithTodoMarker) {
    const file = new File(filePath)
    files.push(file)
  }

  log.info('Parsing FIXME tags...')
  for (const filePath of filesWithFIXMEMarker) {
    const file = new File(filePath)
    files.push(file)
  }
  console.log(files);

  return {
    files,
    async saveChanges(commitMessage) {
      const changedFiles = files.filter(file => file.contents.changed)
      log.info('Files changed: %s', changedFiles.length)
      if (changedFiles.length === 0) {
        return
      }
      for (const file of changedFiles) {
        file.save()
      }
      execFileSync('git', ['add', ...changedFiles.map(file => file.fileName)])
      execFileSync('git', ['commit', '-m', commitMessage], {
        stdio: 'inherit',
      })
      if (!process.env.GITHUB_TOKEN) {
        throw `Maybe you forgot to enable the GITHUB_TOKEN secret?`
      }
      execSync(
        'git push "https://x-access-token:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git" HEAD:"$GITHUB_REF"',
        { stdio: 'inherit' },
      )
    },
  }
}
