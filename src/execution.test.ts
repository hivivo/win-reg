import { jest } from '@jest/globals';
import { ExecException } from 'child_process';

interface MockedCallbackArguments {
  stdout?: string;
  stderr?: string;
  exception?: ExecException;
}

class TestContext {
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

describe('execute', () => {
  const tc = new TestContext();

  it('executes a command and returns the result', async () => {
    const mockStdout = 'stdout';
    const mockStderr = 'stderr';
    const testCommand = 'mock command';

    tc.mockCommand(testCommand, {
      stdout: mockStdout,
      stderr: mockStderr,
    });

    const { ExecutionStatus, execute } = await import('./execution.js');
    const actualResult = await execute(testCommand);
    expect(tc.execMock).toHaveBeenCalledWith(
      testCommand,
      expect.anything(),
      expect.anything(),
    );
    expect(actualResult.status).toBe(ExecutionStatus.Success);
    expect(actualResult.exitCode).toBe(0);
    expect(actualResult.error).toBe(null);
    expect(actualResult.output).toBe(mockStdout);
    expect(actualResult.errorOutput).toBe(mockStderr);
  });

  it('returns the execution exception', async () => {
    const testCommand = 'mock command';
    const mockError = new Error('mock error');

    tc.mockCommand(testCommand, {
      exception: mockError,
    });

    const { ExecutionStatus, execute } = await import('./execution.js');
    const actualResult = await execute(testCommand);
    expect(tc.execMock).toHaveBeenCalledWith(
      testCommand,
      expect.anything(),
      expect.anything(),
    );
    expect(actualResult.status).toBe(ExecutionStatus.Failed);
    expect(actualResult.exitCode).toBe(0);
    expect(actualResult.error).toBe(mockError);
    expect(actualResult.output).toBe('');
    expect(actualResult.errorOutput).toBe('');
  });
});
