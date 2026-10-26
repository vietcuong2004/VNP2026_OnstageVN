import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { selectMockProfiles } from '../lib/mock-talents.ts';

const profiles = JSON.parse(readFileSync(new URL('../public/mock_data/profiles.json', import.meta.url), 'utf8'));

test('sample catalogue has unique IDs and existing local images without account secrets', () => {
  assert.equal(profiles.length, 100);
  assert.equal(new Set(profiles.map((profile) => profile.id)).size, profiles.length);
  const forbidden = /password|remember_token|email|phone|social_id|parent_id/i;
  for (const profile of profiles) {
    assert.ok(!Object.keys(profile).some((key) => forbidden.test(key)));
    assert.ok(profile.photos.some((photo) => photo.category === 'avatar'));
    assert.ok(profile.photos.some((photo) => photo.category === 'lookbook'), `Missing gallery: ${profile.id}`);
    for (const field of ['talent_types', 'skills', 'languages']) {
      assert.ok(Array.isArray(profile[field]));
      assert.ok(profile[field].every((value) => typeof value === 'string'), `Invalid labels: ${profile.id}.${field}`);
    }
    for (const photo of profile.photos) {
      assert.ok(photo.url.startsWith('/mock_data/Talent_Image/'));
      assert.ok(existsSync(fileURLToPath(new URL(`../public${photo.url}`, import.meta.url))));
    }
  }
  assert.equal(profiles[0].photos[0].url.split('/')[3], '1');
  assert.equal(profiles.at(-1).photos[0].url.split('/')[3], '100');
});

test('sample labels remain strings and original photos appear without generated lookbooks', () => {
  assert.deepEqual(profiles[0].talent_types, ['MC']);
  assert.deepEqual(profiles[0].skills, ['acting', 'catwalk', 'livestream', 'dancing']);
  assert.deepEqual(profiles[0].languages, ['Korean']);
  const profile = profiles.find((item) => item.id === '638');
  assert.ok(profile.photos.some((photo) => photo.url === '/mock_data/Talent_Image/6/6_1.jpg'
    && photo.category === 'lookbook'));
  assert.ok(selectMockProfiles(profiles, { type: 'mc', q: 'duong tuyet lan' }).data.length > 0);
});

test('pagination returns distinct pages and terminates after the last page', () => {
  const first = selectMockProfiles(profiles, { page: 1, perPage: 24 });
  const second = selectMockProfiles(profiles, { page: 2, perPage: 24 });
  assert.equal(first.data.length, 24);
  assert.equal(first.meta.total, 100);
  assert.ok(first.meta.has_more);
  assert.ok(!second.data.some((item) => first.data.some((other) => item.id === other.id)));
  const last = selectMockProfiles(profiles, { page: 5, perPage: 24 });
  assert.equal(last.data.length, 4);
  assert.equal(last.meta.has_more, false);
  assert.equal(selectMockProfiles(profiles, { page: 6, perPage: 24 }).data.length, 0);
});

test('search supports unaccented names and combines city, gender and height filters', () => {
  const result = selectMockProfiles(profiles, { q: 'duong tuyet lan' });
  assert.ok(result.data.some((profile) => profile.display_name === 'Dương Tuyết Lan'));
  const sample = profiles[0];
  const filtered = selectMockProfiles(profiles, {
    city: sample.city, gender: sample.gender,
    minHeight: Number(sample.height_cm), maxHeight: Number(sample.height_cm),
  });
  assert.ok(filtered.meta.total > 0);
  assert.ok(filtered.data.every((profile) => profile.city === sample.city
    && profile.gender === sample.gender && Number(profile.height_cm) === Number(sample.height_cm)));
  assert.equal(selectMockProfiles(profiles, { q: 'no-matching-sample-xyz' }).meta.total, 0);
});

test('type aliases and Vietnamese name sorting work on the sample catalogue', () => {
  const sample = [{ id: '1', display_name: 'Bình', talent_types: ['Người mẫu'] },
    { id: '2', display_name: 'An', talent_types: ['PG/PB'] }];
  assert.equal(selectMockProfiles(sample, { type: 'model' }).data[0].id, '1');
  assert.equal(selectMockProfiles(sample, { type: 'pg' }).data[0].id, '2');
  assert.deepEqual(selectMockProfiles(sample, { sort: 'name_asc' }).data.map((p) => p.id), ['2', '1']);
});
