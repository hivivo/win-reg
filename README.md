# windows-reg

Access Windows registry with REG command line tool

## Getting Started

```sh
yarn add windows-reg
```

### To Read a Single Registry Key Value

```typescript
import { query } from 'windows-reg';

console.log(
  await query(
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
    'OneDrive',
  ),
);
```

The example output would be

```javascript
{
  valueName: 'OneDrive',
  valueType: 'REG_SZ',
  value: '"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe" /background'
}
```

### To Read All Values under a Registry Key Recursively

```typescript
import { queryAll } from 'windows-reg';

console.log(
  await queryAll(
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
    true,
  ),
);
```

The example output would be

```javascript
{
  'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run': [
    {
      valueName: 'OneDrive',
      valueType: 'REG_SZ',
      value: '"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe" /background'
    },
    {
      valueName: 'Docker Desktop',
      valueType: 'REG_SZ',
      value: 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe -Autostart'
    },
    ...
  ],
  'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\ExampleSubKey': [
    {
      valueName: 'ExampleBinaryValue',
      valueType: 'REG_BINARY',
      value: <Buffer ad fa df ad fa df ad fa dc ae fa df ea e2 31 3f 23 23 e2 da fd af>
    },
    {
      valueName: 'ExampleNumberValue',
      valueType: 'REG_QWORD',
      value: 1672226
    },
    ...
  ],
}
```

## Developing

### Available Scripts

In the project directory, you can run:

#### `yarn lint`

To lint the code and list the existing issues.\
Usually VSCode will format the code when saving.

#### `yarn build`

Builds the library for publishing to the `dist` folder.

#### `yarn test`

Run the tests. Attaching `--watch` to watch the file changes.

### Developer Support

ESlint, prettier and husky are hooked into the normal developing flows.

## License

Licensed under MIT.
