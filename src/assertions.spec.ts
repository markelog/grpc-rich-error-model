import { describe, expect, it } from '@jest/globals';

import { assertNever } from './assertions';

describe('assertNever', (): void => {
  it('throws an error with the value of the argument', (): void => {
    expect.assertions(1);

    const value = 'foo';

    try {
      assertNever(value as unknown as never);
    } catch (error: unknown) {
      expect((error as Error).message).toBe(
        'Unhandled discriminated union member: "foo".',
      );
    }
  });
});
