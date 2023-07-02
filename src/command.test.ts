import { buildCommand } from './command.js';

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
