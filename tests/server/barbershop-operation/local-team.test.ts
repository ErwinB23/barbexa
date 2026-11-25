import { localTeamConfiguration } from '../../../supabase/functions/_shared/barbershop-operation/composition.ts';

Deno.test(
  '011 local source activation requires the explicit project and exact internal API/database pair',
  () => {
    const config = localTeamConfiguration(
      'app-barberia-002-local',
      'http://kong:8000',
      'postgresql://fixture:fixture@db:5432/postgres',
      undefined,
    );
    if (
      config?.from !== 'no-reply@example.invalid' ||
      config.webOrigin !== 'http://localhost:8081' ||
      config.teamAuthorityEnabled !== true
    )
      throw Error('local activation missing');
  },
);
Deno.test(
  '011 local activation cannot leak into Cloud, another project, or a different backend',
  () => {
    for (const [project, api, db, deployment] of [
      [
        'barberia-app',
        'http://kong:8000',
        'postgresql://fixture:fixture@db:5432/postgres',
        undefined,
      ],
      [
        'app-barberia-002-local',
        'https://vuoncrtkkkquvddunrxx.supabase.co',
        'postgresql://fixture:fixture@db:5432/postgres',
        undefined,
      ],
      [
        'app-barberia-002-local',
        'http://kong:8000',
        'postgresql://fixture:fixture@remote:5432/postgres',
        undefined,
      ],
      [
        'app-barberia-002-local',
        'http://kong:8000',
        'postgresql://fixture:fixture@db:5432/postgres',
        'deployment-fixture',
      ],
      ['app-barberia-002-local', 'http://kong:8000', 'invalid', undefined],
    ] as const)
      if (localTeamConfiguration(project, api, db, deployment) !== undefined)
        throw Error('unsafe local activation');
  },
);
