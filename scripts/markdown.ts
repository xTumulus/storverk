import MarkdownIt from "markdown-it";

/** For site-owner-authored content: raw HTML is disallowed (there's no need for it). */
export const md = new MarkdownIt({ html: false, linkify: true });

/**
 * For GitHub READMEs specifically — the one piece of rendered content not
 * authored by the site owner. READMEs commonly rely on raw HTML (badges,
 * centered images), so this instance allows it; callers MUST run the output
 * through sanitize-html before baking it into generated data.
 */
export const mdUntrusted = new MarkdownIt({ html: true, linkify: true });
