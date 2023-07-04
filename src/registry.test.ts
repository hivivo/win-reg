import { describe, expect, it } from '@jest/globals';
import { TestContext } from './TestContext.js';

describe('query', () => {
  const tc = new TestContext();

  it('sends a REG command to query a specific value name under a reg key', async () => {
    const { RegistryValueType, query } = await import('./registry.js');

    const regKey = 'HKEY_CURRENT_USER\\Software\\WindowsReg';
    const valueName = 'Test';
    const testCommand = `REG "QUERY" "${regKey}" "/v" "${valueName}"`;
    const valueType = RegistryValueType.String;
    const value = 'Test Value';
    tc.mockCommand(testCommand, {
      stdout: `${regKey}\r\n    ${valueName}    ${valueType}    ${value}`,
    });

    const actualResult = await query(regKey, valueName);
    expect(tc.execMock).toHaveBeenCalledWith(
      testCommand,
      expect.anything(),
      expect.anything(),
    );
    expect(actualResult.valueName).toBe(valueName);
    expect(actualResult.valueType).toBe(valueType);
    expect(actualResult.value).toBe(value);
  });

  it('sends a REG command to query all the values under a reg key', async () => {
    const { queryAll } = await import('./registry.js');
    const regKey = 'HKEY_CURRENT_USER\\Software\\WindowsReg';

    await queryAll(regKey);

    expect(tc.execMock).toHaveBeenCalledWith(
      `REG "QUERY" "${regKey}"`,
      expect.anything(),
      expect.anything(),
    );

    await queryAll(regKey, true);

    expect(tc.execMock).toHaveBeenCalledWith(
      `REG "QUERY" "${regKey}" "/s"`,
      expect.anything(),
      expect.anything(),
    );
  });

  it('returns null if the execution fails or the reg key does not exist', async () => {
    const { query, queryAll } = await import('./registry.js');
    const regKey = 'HKEY_CURRENT_USER\\Software\\NotExisting';

    expect(await queryAll(regKey)).toBe(null);
    expect(await query(regKey, 'anything')).toBe(null);
  });

  it('parses different value types when query a reg key', async () => {
    const { RegistryValueType, queryAll } = await import('./registry.js');

    const regKey = 'HKEY_CURRENT_USER\\Software\\WindowsReg';
    const testCommand = `REG "QUERY" "${regKey}"`;
    tc.mockCommand(testCommand, {
      stdout: `${regKey}\r
    NumberValue    ${RegistryValueType.Number32}    123\r
    LongNumberValue    ${RegistryValueType.Number64}    12345\r
    StringValue    ${RegistryValueType.String}    hello abc 123\r
    StringValue2    ${RegistryValueType.ExpandableString}    this is expandable string\r
    MultiStrings    ${RegistryValueType.MultipleStrings}    line 1\\0line 2\\0line last\r
    Binary    ${RegistryValueType.Binary}    68656c6c6f`,
    });

    const actualResult = await queryAll(regKey);
    expect(Object.keys(actualResult)).toContain(regKey);

    const [
      numberValue,
      longNumberValue,
      stringValue,
      expString,
      multiStrings,
      binaryValue,
    ] = actualResult[regKey];
    expect(numberValue.value).toBe(123);
    expect(longNumberValue.value).toBe(12345);
    expect(stringValue.value).toBe('hello abc 123');
    expect(expString.value).toBe('this is expandable string');
    expect(multiStrings.value).toHaveLength(3);
    expect(multiStrings.value[2]).toBe('line last');
    expect((binaryValue.value as Buffer).toString('ascii')).toBe('hello');
  });
});
