export type LegacyRedirect = { source: string; destination: string; permanent: true };

// Populate only after exporting verified URLs from the existing production site.
// Keeping this list empty is safer than inventing redirects that could destroy SEO signals.
export const legacyRedirects: LegacyRedirect[] = [];
