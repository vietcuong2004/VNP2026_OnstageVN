import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { groupSocialAccounts } from '../lib/social-account-groups.ts';

test('all sample profiles show the sum of both TikTok channels and retain each channel', () => {
  const profiles = JSON.parse(readFileSync(new URL('../public/mock_data/profiles.json', import.meta.url), 'utf8'));
  for (const profile of profiles) {
    const groups = groupSocialAccounts(profile.social_accounts);
    const tiktok = groups.find((group) => group.platform === 'TikTok');
    const accounts = profile.social_accounts.filter((account) => account.platform === 'TikTok');
    assert.equal(tiktok.channels.length, 2);
    assert.equal(tiktok.followers, accounts.reduce((total, account) => total + account.followers_count, 0));
    assert.deepEqual(tiktok.channels.map((channel) => channel.name), accounts.map((account) => account.handle));
    assert.deepEqual(tiktok.channels.map((channel) => channel.href), accounts.map((account) => account.url));
    assert.equal(groups.find((group) => group.platform === 'Facebook').channels.length, 1);
  }
});

test('duplicate URLs are not double counted and missing or invalid metrics remain zero', () => {
  const groups = groupSocialAccounts([
    { platform: 'TikTok', url: 'www.tiktok.com/@primary', name: 'Kênh chính', followers_count: '1500' },
    { platform: 'tiktok', url: 'https://www.tiktok.com/@primary/?lang=vi', followers_count: 1500 },
    { platform: 'TikTok', url: 'https://www.tiktok.com/@daily', username: 'daily', followers_count: -10 },
    { platform: 'TikTok', url: 'https://www.tiktok.com/@empty', followers_count: 'not-a-number' },
    { platform: 'TikTok', url: 'javascript:alert(1)', followers_count: 50000 },
    { platform: 'TikTok', url: '', followers_count: 50000 },
    { platform: 'TikTok', url: 'https://', followers_count: 50000 },
  ]);
  assert.equal(groups[0].followers, 1500);
  assert.equal(groups[0].channels.length, 3);
  assert.equal(groups[0].channels[0].name, 'Kênh chính');
  assert.equal(groups[0].channels[1].name, 'daily');
  assert.equal(groups[0].channels[2].name, '@empty');
  assert.equal(groups[1].followers, 0);
  assert.deepEqual(groups[1].channels, []);
});

test('grouping supports single channels, platform aliases and URL-only accounts', () => {
  const groups = groupSocialAccounts([
    { url: 'https://www.instagram.com/example/', followers_count: 2000 },
    { platform: 'YT', url: 'https://www.youtube.com/@example', followers_count: 3000 },
    { platform: 'fb', url: 'https://www.facebook.com/example', followers_count: 4000 },
  ]);
  assert.deepEqual(groups.map((group) => group.followers), [0, 2000, 3000, 4000]);
  assert.equal(groups[2].label, 'Subscribers');
  assert.ok(groups.slice(1).every((group) => group.channels.length === 1));
  assert.ok(groupSocialAccounts([]).every((group) => group.channels.length === 0 && group.followers === 0));
});
