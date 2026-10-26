export type SocialAccountInput = {
  platform?: unknown;
  url?: unknown;
  name?: unknown;
  display_name?: unknown;
  handle?: unknown;
  username?: unknown;
  followers_count?: unknown;
};

const platforms = [
  { platform: "TikTok", key: "tiktok", match: /tiktok/i, label: "Followers" },
  { platform: "Instagram", key: "instagram", match: /instagram|insta/i, label: "Followers" },
  { platform: "YouTube", key: "youtube", match: /youtube|youtu\.be|^yt$/i, label: "Subscribers" },
  { platform: "Facebook", key: "facebook", match: /facebook|fb\.com|^fb$/i, label: "Followers" },
];

export function groupSocialAccounts(accounts: SocialAccountInput[]) {
  return platforms.map(({ match, ...config }) => {
    const seen = new Set<string>();
    const channels = accounts.flatMap((account) => {
      const rawUrl = String(account.url ?? "").trim();
      if (!rawUrl) return [];
      let url: URL;
      try {
        url = new URL(/^[a-z][a-z\d+.-]*:/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
      } catch {
        return [];
      }
      if (!["https:", "http:"].includes(url.protocol)) return [];
      if (!match.test(String(account.platform ?? "")) && !match.test(url.hostname)) return [];
      const identity = `${url.origin}${url.pathname}`.replace(/\/+$/, "").toLowerCase();
      if (seen.has(identity)) return [];
      seen.add(identity);
      const followers = Number(account.followers_count);
      const name = [account.name, account.display_name, account.handle, account.username]
        .map((value) => String(value ?? "").trim()).find(Boolean)
        || url.pathname.split("/").filter(Boolean).at(-1) || config.platform;
      return [{ name, href: url.href, followers: Number.isFinite(followers) && followers > 0 ? followers : 0 }];
    });
    return { ...config, channels, followers: channels.reduce((sum, channel) => sum + channel.followers, 0) };
  });
}
