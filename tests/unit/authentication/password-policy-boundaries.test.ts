import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  passwordChecks,
  newPasswordProblem,
} from '../../../src/features/authentication/domain/password-policy.js';
test('password policy enforces each independent requirement and confirmation', () => {
  for (const value of [
    'Abcd1!x',
    'abcd123!',
    'ABCD123!',
    'Abcdefg!',
    'Abcdef12',
  ])
    assert.equal(newPasswordProblem(value, value), 'weak-password');
  assert.equal(newPasswordProblem('Abcdef1!', 'Abcdef1!'), null);
  assert.equal(
    newPasswordProblem('Abcdef1!', 'different'),
    'password-mismatch',
  );
  assert.equal(passwordChecks('Ab1!😀😀😀😀').length, true);
  assert.equal(passwordChecks('Ab1!😀😀😀').length, false);
});
