import type { Campaign } from './brand-mvp-data';

type Options = {
  page?: number; perPage?: number; q?: string; type?: string; city?: string;
  minBudget?: number; maxBudget?: number; sortOrder?: string;
  nearCity?: string; selectedCity?: string; stage?: string;
};

const normalize = (value: unknown) => String(value ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim()
  .replace(/^(tp\.?\s*|thanh pho\s*)/, '');

export function buildMockCampaigns(seeds: Campaign[], now = new Date()) {
  const dateAfter = (days: number) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  };
  return seeds.filter((seed) => seed.status === 'published').map((seed, index) => {
    const amounts = [...seed.budget.matchAll(/([\d.,]+)\s*(k|triệu)/gi)]
      .map((match) => Number(match[1].replace(',', '.')) * (match[2].toLowerCase() === 'k' ? 1000 : 1000000));
    return {
      id: seed.id,
      slug: seed.id,
      title: seed.title,
      brand: 'OnstageVN',
      job_type: seed.jobType,
      city: seed.city,
      location: seed.address,
      description: seed.description,
      requirements: seed.requirements,
      benefits: seed.benefits,
      budget_raw: seed.budget,
      budget_min: seed.budgetMin ?? amounts[0] ?? null,
      budget_max: seed.budgetMax ?? amounts[1] ?? amounts[0] ?? null,
      budget_unit: 'day',
      talent_quantity: seed.talentQuantity,
      status: 'published',
      application_deadline: dateAfter(7 + index * 3),
      start_date: dateAfter(14 + index * 3),
      end_date: dateAfter(16 + index * 3),
      created_at: dateAfter(-index),
      published_at: dateAfter(-index),
      has_applied: false,
      application: null,
      can_apply: true,
      media: [{ url: '/og_job_banner_default.jpg', category: 'cover', is_primary: true }],
      brand_logo: '/logo_icon.png',
      positions: [{ id: `${seed.id}-position`, talent_type: seed.jobType, quantity: seed.talentQuantity, requirements: seed.requirements }],
    };
  });
}

export function selectMockCampaigns(campaigns: ReturnType<typeof buildMockCampaigns>, options: Options = {}) {
  let data = campaigns.filter((job) => {
    if (options.q && !normalize(`${job.title} ${job.job_type} ${job.description} ${job.brand}`).includes(normalize(options.q))) return false;
    if (options.city && !normalize(job.city).includes(normalize(options.city))) return false;
    if (options.type && !normalize(job.job_type).includes(normalize(options.type))) return false;
    if (options.minBudget && (job.budget_max ?? 0) < options.minBudget) return false;
    if (options.maxBudget && (job.budget_min ?? 0) > options.maxBudget) return false;
    return true;
  });
  const count = data.length;
  // Public demo jobs have no private applications or execution history.
  if (options.stage && options.stage !== 'recruiting') data = [];
  const targetCity = options.sortOrder === 'selected_city' ? options.selectedCity : options.nearCity;
  data.sort((a, b) => {
    if (options.sortOrder === 'oldest') return a.created_at.localeCompare(b.created_at);
    if (options.sortOrder === 'deadline_asc') return a.application_deadline.localeCompare(b.application_deadline);
    if (['near_me', 'selected_city'].includes(options.sortOrder ?? '') && targetCity) {
      const rank = Number(normalize(b.city) === normalize(targetCity)) - Number(normalize(a.city) === normalize(targetCity));
      if (rank) return rank;
    }
    return b.created_at.localeCompare(a.created_at);
  });
  const page = Math.max(1, Math.floor(options.page || 1));
  const perPage = Math.max(1, Math.min(100, Math.floor(options.perPage || 100)));
  return {
    data: data.slice((page - 1) * perPage, page * perPage),
    meta: {
      current_page: page, per_page: perPage, total: data.length,
      last_page: Math.max(1, Math.ceil(data.length / perPage)), has_more: page * perPage < data.length,
      stage_counts: { all: count, recruiting: count, pending: 0, executing: 0, completed: 0 },
    },
  };
}
