import { IFile, ITodo } from './types'

export function parseTodos(file: IFile): ITodo[] {
  const out: Todo[] = []

  let currentTodo: Todo | undefined
  for (const [lineIndex, line] of file.contents.lines.entries()) {
    const match = line.match(/^(\W+\s)TODO(?: \[([^\]\s]+)\])?:(.*)/)
    if (match) {
      const todo = new Todo(file, lineIndex, match[1], match[2], match[3], 'TODO')
      currentTodo = todo
      out.push(todo)
    } else if (currentTodo) {
      const beforePrefix = line.substr(0, currentTodo.prefix.length)
      const afterPrefix = line.substr(currentTodo.prefix.length)
      if (
        beforePrefix.trimRight() === currentTodo.prefix.trimRight() &&
        (!afterPrefix || beforePrefix.match(/\s$/))
      ) {
        currentTodo.handleLine(afterPrefix)
      } else {
        currentTodo = undefined
      }
    }
  }

  for (const [lineIndex, line] of file.contents.lines.entries()) {
    const match = line.match(/^(\W+\s)FIXME(?: \[([^\]\s]+)\])?:(.*)/)
    if (match) {
      const todo = new Todo(file, lineIndex, match[1], match[2], match[3], 'FIXME')
      currentTodo = todo
      out.push(todo)
    } else if (currentTodo) {
      const beforePrefix = line.substr(0, currentTodo.prefix.length)
      const afterPrefix = line.substr(currentTodo.prefix.length)
      if (
        beforePrefix.trimRight() === currentTodo.prefix.trimRight() &&
        (!afterPrefix || beforePrefix.match(/\s$/))
      ) {
        currentTodo.handleLine(afterPrefix)
      } else {
        currentTodo = undefined
      }
    }
  }
  return out
}

class Todo implements ITodo {
  prefix: string
  line: number
  suffix: string
  body: string
  category?: string
  tags?: any[]
  title: string
  marker: string

  private currentReference: string | null

  constructor(
    public file: IFile,
    line: number,
    prefix: string,
    reference: string | null,
    suffix: string,
    marker: string,
  ) {
    this.line = line
    this.prefix = prefix
    this.currentReference = reference
    this.suffix = suffix
    this.title = suffix.trim()
    this.body = ''
    this.marker = marker
  }

  get reference(): string | null {
    return this.currentReference
  }
  set reference(newRef) {
    this.currentReference = newRef
    this.file.contents.changeLine(
      this.line,
      `${this.prefix}${this.marker}${newRef ? ` [${newRef}]` : ''}:${this.suffix}`,
    )
  }

  get startLine(): number {
    return this.line + 1
  }

  handleLine(line: string) {

    if (!this.title) {
      this.title = line
    } else if (line && line.match(/^@category: (.*)/)) {
      this.category = line.split('@category: ')[1];
    } else if (line && line.match(/^@tags: (.*)/)) {
      this.tags = line.split('@tags: ')[1].split(',').map((i) => {

        const color = i.match(/\((.*)\)/);

        return {
          name: i.replace(/\((.*)\)/, ''),
          color: color ? color[1] : '#000000',
        }
      });
    } else if (this.body || line) {
      this.body += (this.body ? '\n' : '') + line
    }
  }
}
