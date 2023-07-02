# windows-reg

Access Windows registry with REG command line tool

## Getting Started

```sh
yarn add windows-reg
```

### To Read a Registry Key Value

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
  hive: 'HKEY_CURRENT_USER',
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
  valueKey: 'OneDrive',
  valueType: 'REG_SZ',
  value: '"C:\\Program Files\\Microsoft OneDrive\\OneDrive.exe" /background'
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
