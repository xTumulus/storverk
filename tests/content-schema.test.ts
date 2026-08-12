import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { load as parseYaml } from "js-yaml";
import matter from "gray-matter";
import type { ZodType } from "zod";
import { siteConfigSchema } from "../schemas/site-config.ts";
import { skillsSchema } from "../schemas/skill.ts";
import { educationSchema } from "../schemas/education.ts";
import { experienceSchema } from "../schemas/experience.ts";
import { credentialsSchema } from "../schemas/credentials.ts";
import { volunteerSchema } from "../schemas/volunteer.ts";
import { languagesSchema } from "../schemas/language.ts";
import { projectFrontmatterSchema } from "../schemas/project.ts";
import { linksSchema } from "../schemas/link.ts";
import { socialSchema } from "../schemas/social.ts";
import { hobbiesSchema } from "../schemas/hobby.ts";
import { devlogFrontmatterSchema } from "../schemas/devlog.ts";
import { homeSchema } from "../schemas/home.ts";
import { contactSchema } from "../schemas/contact.ts";

const CONTENT_DIR = join(import.meta.dirname, "..", "content");

function readYaml(relativePath: string) {
  return parseYaml(readFileSync(join(CONTENT_DIR, relativePath), "utf-8"));
}

// These schemas are what stand between a content typo and a silently blank
// section on the live site — this suite checks both the rules themselves and
// that the checked-in example content actually satisfies them.
describe("schema validation rules", () => {
  it("rejects a skill missing details", () => {
    expect(skillsSchema.safeParse([{ name: "API" }]).success).toBe(false);
  });

  it("rejects a non-URL site domain", () => {
    const result = siteConfigSchema.safeParse({
      site: {
        name: "x",
        domain: "not-a-url",
        description: "x",
        defaultOgImage: "/x.png",
      },
      theme: { daisyTheme: "dark" },
      security: {
        hsts: { enabled: true, maxAgeSeconds: 100, includeSubDomains: true },
      },
      llm: { enabled: false },
      support: { platforms: [] },
    });
    expect(result.success).toBe(false);
  });

  it("applies the default icon when a hobby omits one", () => {
    const result = hobbiesSchema.safeParse([{ id: "x", label: "X" }]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].icon).toBe("interests");
    }
  });

  it("rejects a project with an out-of-range progress value", () => {
    const result = projectFrontmatterSchema.safeParse({
      title: "X",
      summary: "x",
      progress: 150,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a project that sets both `repo` and `repoUrl`", () => {
    const result = projectFrontmatterSchema.safeParse({
      title: "X",
      summary: "x",
      repo: { owner: "octocat", repo: "Hello-World" },
      repoUrl: "https://github.com/octocat/Hello-World",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a support platform type that is not in the allowed enum", () => {
    const result = siteConfigSchema.shape.support.safeParse({
      platforms: [{ type: "venmo", url: "https://venmo.com/x" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("checked-in content files satisfy their schemas", () => {
  it("site.config.yaml", () => {
    expect(
      siteConfigSchema.safeParse(readYaml("site.config.yaml")).success,
    ).toBe(true);
  });

  const yamlCases: [string, ZodType][] = [
    ["about/skills.yaml", skillsSchema],
    ["about/education.yaml", educationSchema],
    ["about/experience.yaml", experienceSchema],
    ["about/credentials.yaml", credentialsSchema],
    ["about/volunteer.yaml", volunteerSchema],
    ["about/languages.yaml", languagesSchema],
    ["links/links.yaml", linksSchema],
    ["social/social.yaml", socialSchema],
    ["hobbies/hobbies.yaml", hobbiesSchema],
    ["contact.yaml", contactSchema],
  ];

  it.each(yamlCases)("%s", (file, schema) => {
    const result = schema.safeParse(readYaml(file));
    expect(result.success ? true : result.error.issues, file).toBe(true);
  });

  it("home.md frontmatter", () => {
    const { data } = matter(readFileSync(join(CONTENT_DIR, "home.md"), "utf-8"));
    const result = homeSchema.safeParse(data);
    expect(result.success ? true : result.error.issues).toBe(true);
  });

  it("every project file has valid frontmatter", () => {
    const dir = join(CONTENT_DIR, "projects");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const { data } = matter(readFileSync(join(dir, file), "utf-8"));
      const result = projectFrontmatterSchema.safeParse(data);
      expect(result.success ? true : result.error.issues, file).toBe(true);
    }
  });

  it("every devlog entry has valid frontmatter and a date-prefixed filename", () => {
    const devlogsRoot = join(CONTENT_DIR, "projects/devlogs");
    for (const projectSlug of readdirSync(devlogsRoot)) {
      const dir = join(devlogsRoot, projectSlug);
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
        expect(file).toMatch(/^\d{4}-\d{2}-\d{2}-/);
        const { data } = matter(readFileSync(join(dir, file), "utf-8"));
        const result = devlogFrontmatterSchema.safeParse(data);
        expect(
          result.success ? true : result.error.issues,
          `${projectSlug}/${file}`,
        ).toBe(true);
      }
    }
  });
});
