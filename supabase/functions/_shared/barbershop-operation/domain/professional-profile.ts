import { BusinessError, utcInstant } from './values.ts';
import { teamRecord, teamId } from './team-input.ts';
import type { Professional } from './types.ts';
export interface ProfileDraft {
  readonly professionalName: string;
  readonly description: string;
  readonly instagram: string | null;
  readonly tiktok: string | null;
  readonly facebook: string | null;
}
export interface ProfessionalProfile extends Professional, ProfileDraft {
  readonly barbershopName: string;
  readonly memberSince: string | null;
}
const fields = [
  'professionalName',
  'description',
  'instagram',
  'tiktok',
  'facebook',
] as const;
const platforms = {
  instagram: /^https:\/\/(?:www\.)?instagram\.com(?:\/[^\s<>\\]*)?$/i,
  tiktok: /^https:\/\/(?:(?:www|vm|vt)\.)?tiktok\.com(?:\/[^\s<>\\]*)?$/i,
  facebook:
    /^https:\/\/(?:(?:www|m)\.)?(?:facebook\.com|fb\.com)(?:\/[^\s<>\\]*)?$/i,
};
export function profileDraft(raw: unknown): ProfileDraft {
  const r = teamRecord(raw, fields);
  if (
    typeof r.professionalName !== 'string' ||
    !r.professionalName.trim() ||
    typeof r.description !== 'string' ||
    Array.from(r.description.trim()).length > 250
  )
    throw new BusinessError('INVALID_INPUT');
  const social = (key: keyof typeof platforms) => {
    if (r[key] === null || r[key] === '') return null;
    if (typeof r[key] !== 'string') throw new BusinessError('INVALID_INPUT');
    const v = (r[key] as string).trim();
    if (!v) return null;
    if (
      Array.from(v).length > 250 ||
      (!platforms[key].test(v) &&
        !/^[^<>\u0000-\u001f\u007f:/\\]{1,100}$/u.test(v))
    )
      throw new BusinessError('INVALID_INPUT');
    return v;
  };
  return Object.freeze({
    professionalName: r.professionalName.trim(),
    description: r.description.trim(),
    instagram: social('instagram'),
    tiktok: social('tiktok'),
    facebook: social('facebook'),
  });
}
export type ProfileCommand =
  | {
      readonly action: 'get-own-professional-profile';
      readonly barbershopId: string;
    }
  | {
      readonly action: 'update-own-professional-profile';
      readonly barbershopId: string;
      readonly profile: ProfileDraft;
    };
export function profileCommand(raw: unknown): ProfileCommand {
  const read =
    !!raw &&
    typeof raw === 'object' &&
    'action' in raw &&
    raw.action === 'get-own-professional-profile';
  const r = teamRecord(
    raw,
    read ? ['action', 'barbershopId'] : ['action', 'barbershopId', 'profile'],
  );
  if (read)
    return {
      action: 'get-own-professional-profile',
      barbershopId: teamId(r.barbershopId),
    };
  if (r.action !== 'update-own-professional-profile')
    throw new BusinessError('INVALID_INPUT');
  return {
    action: 'update-own-professional-profile',
    barbershopId: teamId(r.barbershopId),
    profile: profileDraft(r.profile),
  };
}
export function professionalProfile(raw: unknown): ProfessionalProfile {
  try {
    const r = teamRecord(raw, [
      'id',
      'userId',
      'barbershopId',
      'active',
      'barbershopName',
      'memberSince',
      ...fields,
    ]);
    if (
      r.active !== true ||
      typeof r.barbershopName !== 'string' ||
      !r.barbershopName.trim()
    )
      throw new Error('invalid');
    return Object.freeze({
      id: teamId(r.id),
      userId: teamId(r.userId),
      barbershopId: teamId(r.barbershopId),
      active: true,
      barbershopName: r.barbershopName,
      memberSince: r.memberSince === null ? null : utcInstant(r.memberSince),
      ...profileDraft(Object.fromEntries(fields.map((k) => [k, r[k]]))),
    });
  } catch {
    throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  }
}
