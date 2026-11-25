import { test } from 'node:test';
import { loadCore } from './load-core.mjs';
import { careContract } from '../../contracts/care-contract.mjs';
careContract(
  test,
  loadCore('src/features/reservations/domain/care.ts'),
  'client',
);
