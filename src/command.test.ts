import { describe, expect, it } from '@jest/globals';
import { RegCommand, buildCommand } from './command.js';

describe('buildCommand', () => {
  it('allows to build command without any argument', () => {
    expect(buildCommand('dir')).toBe('dir');
  });

  it('adds quotes to all the arguments', () => {
    expect(buildCommand('dir', ['/a', '/b', '/c', '/d'])).toBe(
      'dir "/a" "/b" "/c" "/d"',
    );
  });

  it('allows empty argument list', () => {
    expect(buildCommand('dir', [])).toBe('dir');
  });

  it('handles special characters in the argument list', () => {
    expect(buildCommand('dir', ['path with space', 'ar g"s"'])).toBe(
      'dir "path with space" "ar g""s"""',
    );
  });
});

describe('RegCommand', () => {
  it('builds REG query command', () => {
    const key = 'mockKey';
    const valueName = 'mockValueName';
    const result = RegCommand.query(key, valueName);
    expect(result).toMatch(new RegExp(`reg.*${key}.*${valueName}`, 'iu'));
  });

  it('builds REG query all command', () => {
    const key = 'mockKey';

    const resultNonRecursively = RegCommand.queryAll(key, false);
    expect(resultNonRecursively).toMatch(new RegExp(`reg.*${key}`, 'iu'));
    expect(resultNonRecursively).not.toMatch(/\/s/iu);

    const resultRecursively = RegCommand.queryAll(key, true);
    expect(resultRecursively).toMatch(new RegExp(`reg.*${key}`, 'iu'));
    expect(resultRecursively).toMatch(/\/s/iu);
  });
});
