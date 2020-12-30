import { cli } from 'tkt'
import { runMain } from './TodoActionsMain'

cli()
  .command('$0', 'Collect TODOs and create issues', {}, async args => {
    await runMain()
  })
  .parse()
