import { createEnsureProfileService } from '../_shared/tenant-foundation/composition.ts';
Deno.serve(createEnsureProfileService('barbershop'));
