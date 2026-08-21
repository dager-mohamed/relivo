/**
 * `companies.socials` is a jsonb map of platform to URL. Nobody knows what
 * Relivo calls a platform, but everybody has the profile open in a tab — so the
 * editor takes a pasted link and works the platform out from the hostname. One
 * field, no picker.
 *
 * `Website` is the fallback for anything unrecognised, which keeps the field
 * useful for the company blog or a press page.
 */
export type SocialPlatform = {
  /** The key stored in `socials`, and the icon's key in components/icons. */
  id: string;
  /** Hostnames that identify it, without `www.`. */
  hosts: string[];
  /** URL to the bit worth reading in a 200px column. */
  toHandle: (url: string) => string;
};

export const socialPlatforms: SocialPlatform[] = [
  segment("LinkedIn", ["linkedin.com"]),
  segment("X", ["x.com", "twitter.com"]),
  segment("GitHub", ["github.com"]),
  segment("YouTube", ["youtube.com", "youtu.be"]),
  segment("Instagram", ["instagram.com"]),
  segment("Facebook", ["facebook.com", "fb.com"]),
  segment("TikTok", ["tiktok.com"]),
  segment("Telegram", ["t.me", "telegram.me"]),
  segment("WhatsApp", ["wa.me", "whatsapp.com"]),
  segment("Discord", ["discord.gg", "discord.com"]),
  segment("Slack", ["slack.com"]),
  segment("Dribbble", ["dribbble.com"]),
  segment("Behance", ["behance.net"]),
  segment("Reddit", ["reddit.com"]),
  segment("Pinterest", ["pinterest.com"]),
  segment("Twitch", ["twitch.tv"]),
  {
    id: "Website",
    hosts: [],
    toHandle: (url) => host(url) || url,
  },
];

const website = socialPlatforms[socialPlatforms.length - 1]!;

/** Never returns undefined — an unrecognised host is a Website. */
export function detectPlatform(input: string): SocialPlatform {
  const hostname = host(normalizeSocialUrl(input));
  return (
    socialPlatforms.find((platform) =>
      platform.hosts.some(
        (candidate) =>
          hostname === candidate || hostname.endsWith(`.${candidate}`),
      ),
    ) ?? website
  );
}

/** `sony.com/x` and `https://sony.com/x` are the same paste. */
export function normalizeSocialUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "") return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function socialPlatform(id: string): SocialPlatform | undefined {
  return socialPlatforms.find((platform) => platform.id === id);
}

/** Falls back to the bare address, so a key we no longer know still reads. */
export function socialHandle(id: string, url: string): string {
  return (socialPlatform(id) ?? website).toHandle(url);
}

// The last meaningful path segment: `/company/sony` and `/sony` both read
// `sony`, which is what a person recognises. Falls back to the host for a
// profile that lives at the root.
function segment(id: string, hosts: string[]): SocialPlatform {
  return {
    id,
    hosts,
    toHandle: (url) => {
      const parts = path(url).split("/").filter(Boolean);
      return parts[parts.length - 1] ?? host(url);
    },
  };
}

function host(url: string): string {
  return parse(url)?.hostname.replace(/^www\./, "") ?? "";
}

function path(url: string): string {
  return parse(url)?.pathname ?? "";
}

function parse(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
