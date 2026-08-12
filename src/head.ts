import { useHead } from "@unhead/vue";
import { siteConfig } from "./generated/site-config";

interface PageMeta {
  title: string;
  description?: string;
  image?: string;
  path: string;
}

/** Per-route title/description/OG/Twitter tags — the mechanism that makes link unfurls on LinkedIn/Slack/etc. show the right content. */
export function usePageHead(meta: PageMeta) {
  const fullTitle = `${meta.title} — ${siteConfig.site.name}`;
  const description = meta.description ?? siteConfig.site.description;
  const image = meta.image ?? siteConfig.site.defaultOgImage;
  const url = `${siteConfig.site.domain}${meta.path}`;

  useHead({
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    link: [{ rel: "canonical", href: url }],
  });
}
