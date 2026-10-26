import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { campaigns } from '../lib/brand-mvp-data.ts';
import { buildMockCampaigns, selectMockCampaigns } from '../lib/mock-campaigns.ts';

const now = new Date('2026-10-26T05:00:00Z');
const jobs = buildMockCampaigns(campaigns, now);

test('published sample jobs have readable details, future dates and local cover images', () => {
  assert.equal(jobs.length, campaigns.filter((job) => job.status === 'published').length);
  assert.ok(jobs.length > 0);
  for (const job of jobs) {
    assert.ok(job.title && job.description && job.requirements && job.city);
    assert.ok(job.application_deadline > '2026-10-26');
    assert.ok(job.start_date > job.application_deadline);
    assert.ok(job.end_date >= job.start_date);
    assert.ok(job.budget_min > 0 && job.budget_max >= job.budget_min);
    assert.ok(existsSync(new URL(`../public${job.media[0].url}`, import.meta.url)));
    assert.equal(job.application, null);
    assert.equal(job.has_applied, false);
    assert.equal(jobs.find((other) => other.id === job.slug), job);
  }
});

test('job pagination terminates and recruitment counts are consistent', () => {
  const first = selectMockCampaigns(jobs, { page: 1, perPage: 2, stage: 'recruiting' });
  const next = selectMockCampaigns(jobs, { page: 2, perPage: 2 });
  assert.equal(first.data.length, 2);
  assert.equal(first.meta.total, jobs.length);
  assert.equal(first.meta.stage_counts.recruiting, jobs.length);
  assert.ok(first.meta.has_more);
  assert.ok(next.data.every((item) => !first.data.some((other) => other.id === item.id)));
  assert.equal(selectMockCampaigns(jobs, { page: 99, perPage: 2 }).data.length, 0);
  assert.equal(selectMockCampaigns(jobs, { stage: 'pending' }).meta.total, 0);
});

test('job search, location aliases, types, budget and date sorting work', () => {
  assert.ok(selectMockCampaigns(jobs, { q: 'beauty' }).data.length > 0);
  const city = selectMockCampaigns(jobs, { city: 'Ho Chi Minh' });
  assert.ok(city.data.length > 0);
  assert.ok(city.data.every((job) => job.city === 'TP. Hồ Chí Minh'));
  assert.ok(selectMockCampaigns(jobs, { type: 'KOC' }).data.every((job) => job.job_type.includes('KOC')));
  const budget = selectMockCampaigns(jobs, { minBudget: 1000000 });
  assert.ok(budget.data.length > 0);
  assert.ok(budget.data.every((job) => job.budget_max >= 1000000));
  const sorted = selectMockCampaigns(jobs, { sortOrder: 'deadline_asc' }).data;
  assert.deepEqual(sorted.map((job) => job.application_deadline), sorted.map((job) => job.application_deadline).sort());
  assert.equal(selectMockCampaigns(jobs, { q: 'no-sample-job-xyz' }).meta.total, 0);
});
