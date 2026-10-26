import type { BackendProfile, LoadBrandTalentsOptions } from './brand-api';

export const usesMockProfiles = () => process.env.NEXT_PUBLIC_PROFILE_SOURCE === 'mock';

let profilesPromise: Promise<BackendProfile[]> | undefined;

export function loadMockProfiles(): Promise<BackendProfile[]> {
  if (!profilesPromise) {
    profilesPromise = fetch('/mock_data/profiles.json')
      .then(async (response) => {
        if (!response.ok) throw new Error('Cannot load sample profiles');
        return await response.json() as BackendProfile[];
      })
      .catch((error) => {
        profilesPromise = undefined;
        throw error;
      });
  }
  return profilesPromise;
}

function normalize(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().trim();
}

function talentType(value: unknown): string {
  const type = normalize(value);
  if (['nguoi mau', 'model', 'lookbook'].includes(type)) return 'model';
  if (['pg', 'pb', 'pg/pb', 'pg / pb', 'pg_model'].includes(type)) return 'pg';
  if (['kol', 'kols', 'influencer'].includes(type)) return 'kol';
  return type;
}

export function selectMockProfiles(profiles: BackendProfile[], options: LoadBrandTalentsOptions = {}) {
  const selectedTypes = (Array.isArray(options.type) ? options.type : options.type?.split(',') ?? [])
    .map(talentType).filter((type) => type && type !== 'tat ca');
  const query = normalize(options.q);
  const city = normalize(options.city);
  const gender = normalize(options.gender);
  const today = new Date();
  const data = profiles.filter((profile) => {
    if (query && !normalize([profile.display_name, profile.city, profile.district, profile.bio,
      ...(profile.talent_types ?? []), ...(profile.skills ?? [])].join(' ')).includes(query)) return false;
    if (city && city !== 'tat ca' && normalize(profile.city) !== city) return false;
    if (gender && gender !== 'tat ca' && normalize(profile.gender) !== gender) return false;
    if (selectedTypes.length && !profile.talent_types?.some((type) => selectedTypes.includes(talentType(type)))) return false;
    const height = Number(profile.height_cm) || 0;
    if (options.minHeight && height < options.minHeight) return false;
    if (options.maxHeight && height > options.maxHeight) return false;
    if (options.minAge || options.maxAge) {
      const birth = new Date(String(profile.birth_date));
      if (Number.isNaN(birth.getTime())) return false;
      const beforeBirthday = today.getMonth() < birth.getMonth()
        || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
      const age = today.getFullYear() - birth.getFullYear() - Number(beforeBirthday);
      if (options.minAge && age < options.minAge) return false;
      if (options.maxAge && age > options.maxAge) return false;
    }
    return true;
  });
  const collator = new Intl.Collator('vi');
  const proximity = (profile: BackendProfile) => Number(Boolean(options.nearCity) && normalize(profile.city) === normalize(options.nearCity)) * 2
    + Number(Boolean(options.nearDistrict) && normalize(profile.district) === normalize(options.nearDistrict));
  data.sort((a, b) => {
    switch (options.sort) {
      case 'name_asc': return collator.compare(a.display_name ?? '', b.display_name ?? '');
      case 'name_desc': return collator.compare(b.display_name ?? '', a.display_name ?? '');
      case 'oldest': return String(a.created_at).localeCompare(String(b.created_at)) || Number(a.id) - Number(b.id);
      case 'newest': case 'latest': return String(b.created_at).localeCompare(String(a.created_at)) || Number(b.id) - Number(a.id);
      case 'near_me': return proximity(b) - proximity(a) || Number(b.rating ?? 0) - Number(a.rating ?? 0);
      case 'rating': return Number(b.rating ?? 0) - Number(a.rating ?? 0) || Number(a.id) - Number(b.id);
      default: return Number(b.profile_completion ?? 0) - Number(a.profile_completion ?? 0) || Number(a.id) - Number(b.id);
    }
  });
  const page = Math.max(1, Math.floor(options.page || 1));
  const perPage = Math.max(1, Math.min(100, Math.floor(options.perPage || 20)));
  return {
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: {
      current_page: page,
      per_page: perPage,
      total: data.length,
      last_page: Math.max(1, Math.ceil(data.length / perPage)),
      has_more: page * perPage < data.length,
    },
  };
}
