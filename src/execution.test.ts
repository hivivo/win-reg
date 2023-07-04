import { describe, expect, it } from '@jest/globals';
import { TestContext } from './TestContext.js';

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
