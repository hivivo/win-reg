import { ExecException, exec } from 'node:child_process';

export enum ExecutionStatus {
  Success = 'success',
  Failed = 'failed',
}

export interface ExecutionResult {
  status: ExecutionStatus;
  output: string;
  errorOutput: string;
  exitCode: number;
  error: ExecException | null;
}

/**
 * Execute a command and return the result
 * @param {string} command command line
 * @returns result after execution
 */
export function execute(command: string): Promise<ExecutionResult> {
  return new Promise((resolve: (value: ExecutionResult) => void) => {
    exec(
      command,
      {
        windowsHide: true,
      },
      (error: ExecException | null, stdout: string, stderr: string) => {
        resolve({
          status: error ? ExecutionStatus.Failed : ExecutionStatus.Success,
          output: stdout,
          errorOutput: stderr,
          exitCode: error?.code ?? 0,
          error,
        });
      },
    );
  });
}
