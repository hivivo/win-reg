import { jest } from '@jest/globals';
import { ExecException } from 'child_process';

interface MockedCallbackArguments {
  stdout?: string;
  stderr?: string;
  exception?: ExecException;
}

export class TestContext {
  readonly execMock: jest.Mock;
  private mockedCommands: Record<string, MockedCallbackArguments>;
  constructor() {
    this.execMock = jest
      .fn()
      .mockImplementation(
        (
          command: string,
          _options: unknown,
          cb: (e: ExecException | null, so: string, se: string) => void,
        ) => {
          if (this.mockedCommands[command]) {
            cb(
              this.mockedCommands[command].exception ?? null,
              this.mockedCommands[command].stdout ?? '',
              this.mockedCommands[command].stderr ?? '',
            );
          } else {
            cb(new Error(`No mock for command: ${command}`), '', '');
          }
        },
      );
    this.mockedCommands = {};
    jest.unstable_mockModule('node:child_process', () => ({
      exec: this.execMock,
    }));
  }
  mockCommand(command: string, args: MockedCallbackArguments) {
    this.mockedCommands[command] = args;
  }
}
