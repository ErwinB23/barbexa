/* global Deno */
import * as api from '../../../supabase/functions/_shared/reservations/domain/care.ts';
import { careContract } from '../../contracts/care-contract.mjs';
careContract(Deno.test, api, 'server');
