import { Buffer } from 'node:buffer';
import { RegCommand } from './command.js';
import { ExecutionStatus, execute } from './execution.js';

export enum RegistryHiveType {
  HKLM = 'HKEY_LOCAL_MACHINE',
  HKCU = 'HKEY_CURRENT_USER',
  HKCR = 'HKEY_CLASSES_ROOT',
  HKU = 'HKEY_USERS',
  HKCC = 'HKEY_CURRENT_CONFIG',
  UNKNOWN = 'UNKNOWN',
}

export enum RegistryValueType {
  String = 'REG_SZ',
  MultipleStrings = 'REG_MULTI_SZ',
  ExpandableString = 'REG_EXPAND_SZ',
  Number32 = 'REG_DWORD',
  Number64 = 'REG_QWORD',
  Binary = 'REG_BINARY',
  Link = 'REG_LINK',
  None = 'REG_NONE',
  UNKNOWN = 'UNKNOWN',
}

export type RegistryValue = number | string | Buffer | string[];

export interface RegistryValueResult {
  valueName: string;
  valueType: RegistryValueType;
  value: RegistryValue;
}

type ResultKeyMatchType = [string, RegistryHiveType, string];
const ResultKeyMatchPattern = new RegExp(
  `^(${Object.values(RegistryHiveType).join('|')})(.*)$`,
);

type ResultValueMatchType = [string, string, RegistryValueType, string];
const ResultValueMatchPattern = new RegExp(
  `^\\s{4}(.*)\\s{4}(${Object.values(RegistryValueType).join('|')})\\s{4}(.*)$`,
);

function parseValue(type: RegistryValueType, value: string): RegistryValue {
  switch (type) {
    case RegistryValueType.Number32:
    case RegistryValueType.Number64:
      return Number(value);
    case RegistryValueType.MultipleStrings:
      return value.split('\\0');
    case RegistryValueType.Binary:
      return Buffer.from(value, 'hex');
    default:
      return value;
  }
}

function parseKeyLineResult(line: string) {
  const matches = line.match(ResultKeyMatchPattern) as ResultKeyMatchType;
  if (matches) {
    return {
      key: matches[0],
      hive: matches[1],
      path: matches[2],
    };
  }
  return null;
}

function parseValueLineResult(line: string): RegistryValueResult {
  const matches = line.match(ResultValueMatchPattern) as ResultValueMatchType;
  if (matches) {
    return {
      valueName: matches[1],
      valueType: matches[2],
      value: parseValue(matches[2], matches[3]),
    };
  }
  return null;
}

function parseOutput(output: string): Record<string, RegistryValueResult[]> {
  const result = {} as Record<string, RegistryValueResult[]>;
  const lines = output.split('\r\n');
  let lastKey = '';
  lines.forEach((line) => {
    const keyLine = parseKeyLineResult(line);
    if (keyLine) {
      lastKey = keyLine.key;
      result[lastKey] = [];
    } else {
      const valueLine = parseValueLineResult(line);
      if (valueLine) {
        result[lastKey].push(valueLine);
      }
    }
  });
  return result;
}

/**
 * Query a specific valueName under the reg key
 *
 * @param key the reg key to look for the valueName
 * @param valueName the value key to look up
 * @returns {Promise<RegistryValueResult|null>} the query result
 */
export async function query(
  key: string,
  valueName: string,
): Promise<RegistryValueResult | null> {
  const { status, output } = await execute(RegCommand.query(key, valueName));
  if (status !== ExecutionStatus.Success) {
    return null;
  }

  const result = Object.values(parseOutput(output));

  if (!result.length || !result[0].length) {
    return null;
  }
  return result[0][0];
}

export async function queryAll(key: string, recursively = false) {
  const { status, output } = await execute(
    RegCommand.queryAll(key, recursively),
  );
  if (status !== ExecutionStatus.Success) {
    return null;
  }

  const result = parseOutput(output);
  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
}
