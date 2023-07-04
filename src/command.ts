export function buildCommand(main: string, args?: string[]) {
  let command = main;
  if (args && args.length) {
    const remains = args.map((a) => `"${a.replace(/"/g, '""')}"`).join(' ');
    command = `${command} ${remains}`;
  }
  return command;
}

export const RegCommand = {
  query: (key: string, valueName: string) =>
    buildCommand('REG', ['QUERY', key, '/v', valueName]),
  queryAll: (key: string, recursively: boolean) =>
    buildCommand('REG', ['QUERY', key, ...(recursively ? ['/s'] : [])]),

  delete: (key: string) => buildCommand('REG', ['DELETE', key, '/f']),
  export: (key: string, file: string) =>
    buildCommand('REG', ['EXPORT', key, file]),
  import: (file: string) => buildCommand('REG', ['IMPORT', file]),
};
