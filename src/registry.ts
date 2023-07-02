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

export type RegistryValue = number | string | Buffer | null;

export interface RegistryValueResult {
  hive: RegistryHiveType;
  key: string;
  valueKey: string;
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
    case RegistryValueType.Binary:
      return Buffer.from(value, 'hex');
    default:
      return value;
  }
}

export async function query(key: string, valueKey: string) {
  const { status, output } = await execute(RegCommand.query(key, valueKey));
  if (status !== ExecutionStatus.Success) {
    return null;
  }

  const result: RegistryValueResult = {
    hive: RegistryHiveType.UNKNOWN,
    key: '',
    valueKey: '',
    valueType: RegistryValueType.UNKNOWN,
    value: null,
  };
  const lines = output.split('\r\n');
  lines.forEach((l) => {
    let matches = l.match(ResultKeyMatchPattern);
    if (matches) {
      [, result.hive, result.key] = matches as ResultKeyMatchType;
    } else {
      matches = l.match(ResultValueMatchPattern);
      let rawValue = result.value;
      if (matches) {
        [, result.valueKey, result.valueType, rawValue] =
          matches as ResultValueMatchType;
        result.value = parseValue(result.valueType, rawValue);
      }
    }
  });
  if (!result.valueKey) {
    return null;
  }
  return result;
}
