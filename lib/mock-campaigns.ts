import type { Campaign } from './brand-mvp-data';
import jobDetails from '../public/mock_data/jobs/details.json' with { type: 'json' };

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
    const detail = jobDetails.find((item) => item.id === seed.id);
    if (!detail) throw new Error(`Missing sample campaign details: ${seed.id}`);
    const startOffset = 14 + index * 3;
    const imageUrl = `/mock_data/jobs/${detail.image}`;
    return {
      ...detail,
      id: seed.id,
      slug: seed.id,
      title: detail.title,
      job_type: seed.jobType,
      city: seed.city,
      requirements: detail.requirements.join('\n'),
      benefits: detail.benefits.join('\n'),
      roles: detail.positions.map((position) => position.talent_type),
      budget_raw: `${detail.budget_min.toLocaleString('vi-VN')}–${detail.budget_max.toLocaleString('vi-VN')} VND/ngày`,
      budget_unit: 'day',
      talent_quantity: detail.positions.reduce((total, position) => total + position.quantity, 0),
      status: 'published',
      application_deadline: dateAfter(7 + index * 3),
      start_date: dateAfter(startOffset),
      end_date: dateAfter(startOffset + 2),
      event_date: dateAfter(startOffset),
      created_at: dateAfter(-index),
      published_at: dateAfter(-index),
      has_applied: false,
      application: null,
      can_apply: true,
      media: [{ id: `${seed.id}-cover`, url: imageUrl, category: 'cover', is_primary: true, caption: detail.image_caption }],
      brand_logo: '/logo_icon.png',
      positions: detail.positions.map((position, i) => ({ ...position, id: `${seed.id}-position-${i + 1}` })),
      events: detail.events.map((event, i) => ({
        id: `${seed.id}-event-${i + 1}`,
        name: event.name,
        start_date: dateAfter(startOffset + event.day_offset),
        end_date: dateAfter(startOffset + (event.end_day_offset ?? event.day_offset)),
        start_time: event.start_time,
        end_time: event.end_time,
        location: detail.location,
        content: event.content,
      })),
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
