import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { dump as dumpYaml } from "js-yaml";
import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { skillsSchema } from "../schemas/skill.ts";
import { educationSchema } from "../schemas/education.ts";
import { experienceSchema } from "../schemas/experience.ts";
import { credentialsSchema } from "../schemas/credentials.ts";
import { volunteerSchema } from "../schemas/volunteer.ts";
import { languagesSchema } from "../schemas/language.ts";

// Local, owner-run tool: reads a resume file, sends it to Claude for
// structured extraction, and overwrites content/about/*.yaml + summary.md
// with the result. Never runs as part of `npm run build`/`dev` — invoke it
// manually (`npm run generate:resume -- path/to/resume.pdf`) when you want
// to (re)seed your content from a resume. Review the diff before committing;
// this is a starting point, not a final draft.
//
// Auth: the Anthropic SDK resolves credentials automatically — either
// ANTHROPIC_API_KEY in the environment, or a Claude.ai (Pro/Max) login via
// the `ant` CLI (`ant auth login`, see
// https://platform.claude.com/docs/en/api/sdks/cli). No flags needed here.

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const HOME_DIR = join(CONTENT_DIR, "about");

interface ExtractedResume {
  name: string;
  title: string;
  summary: string;
  skills: unknown;
  education: unknown;
  experience: unknown;
  credentials: unknown;
  volunteer: unknown;
  languages: unknown;
}

const RESUME_JSON_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Full name of the resume's owner." },
    title: {
      type: "string",
      description: "Current or most recent professional title, e.g. 'Senior Software Engineer'.",
    },
    summary: {
      type: "string",
      description:
        "A 3-5 sentence first-person professional summary/bio synthesized from the resume. Plain prose — no markdown headers, no bullet points.",
    },
    skills: {
      type: "array",
      description: "Skills grouped into categories (e.g. 'Languages', 'Infrastructure').",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Category name." },
          details: { type: "array", items: { type: "string" } },
        },
        required: ["name", "details"],
        additionalProperties: false,
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          year: { type: "string", description: "Graduation year, e.g. '2024'." },
        },
        required: ["school", "degree", "year"],
        additionalProperties: false,
      },
    },
    experience: {
      type: "array",
      description: "Most recent role first.",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM" },
          endDate: {
            type: ["string", "null"],
            description: "YYYY-MM, or null if this is the current role.",
          },
          summary: { type: "string", description: "One-sentence description of the role." },
          highlights: {
            type: "array",
            items: { type: "string" },
            description: "Bullet-point achievements, verbatim or lightly cleaned up from the resume.",
          },
        },
        required: ["company", "title", "startDate", "endDate", "summary", "highlights"],
        additionalProperties: false,
      },
    },
    credentials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          date: { type: "string", description: "YYYY-MM" },
          url: { type: ["string", "null"], description: "Verification URL if present, else null." },
        },
        required: ["name", "issuer", "date", "url"],
        additionalProperties: false,
      },
    },
    volunteer: {
      type: "array",
      items: {
        type: "object",
        properties: {
          organization: { type: "string" },
          role: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM" },
          endDate: { type: ["string", "null"], description: "YYYY-MM, or null if ongoing." },
          summary: { type: "string" },
        },
        required: ["organization", "role", "startDate", "endDate", "summary"],
        additionalProperties: false,
      },
    },
    languages: {
      type: "array",
      description: "Spoken/written languages, not programming languages.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          proficiency: {
            type: "string",
            description: "e.g. 'Native', 'Fluent', 'Conversational'.",
          },
        },
        required: ["name", "proficiency"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "name",
    "title",
    "summary",
    "skills",
    "education",
    "experience",
    "credentials",
    "volunteer",
    "languages",
  ],
  additionalProperties: false,
} as const;

const EXTRACTION_PROMPT = 
`
Extract this resume into the given schema.

Rules:
- Only use information present in the resume. Never invent employers, dates, credentials, or skills.
- If a field genuinely isn't in the resume (e.g. no certifications), return an empty array for it.
- Dates are "YYYY-MM". If the resume only gives a year, use "YYYY-01". If a role/credential is current/ongoing, set endDate to null.
- "skills" should group related skills under short category names (e.g. "Languages", "Infrastructure"), the way a resume's own skills section is usually organized.
- "languages" means spoken/written languages, not programming languages.
- "summary" is a first-person professional bio synthesized from the resume's summary/objective section (or the overall resume if there isn't one) — not a copy-paste, and not a list.
- Do not add comments or anything else to the files that indicates how they were generated or what technologies/models were used to create them.
`;

function buildResumeContentBlock(filePath: string): Anthropic.ContentBlockParam {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const data = readFileSync(filePath).toString("base64");
    return {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data },
    };
  }
  if (ext === ".txt" || ext === ".md") {
    return { type: "text", text: readFileSync(filePath, "utf-8") };
  }
  throw new Error(`Unsupported resume file type "${ext}" — use a .pdf, .txt, or .md file.`);
}

async function extractResume(filePath: string): Promise<ExtractedResume> {
  const client = new Anthropic();
  const resumeBlock = buildResumeContentBlock(filePath);
  const outputFormat = jsonSchemaOutputFormat(RESUME_JSON_SCHEMA);

  const message = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    output_config: { format: outputFormat },
    messages: [
      {
        role: "user",
        content: [resumeBlock, { type: "text", text: EXTRACTION_PROMPT }],
      },
    ],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Claude declined to process this resume (safety refusal).");
  }
  if (!message.parsed_output) {
    throw new Error(
      `No structured output returned (stop_reason: ${message.stop_reason}). Try again, or check the file isn't truncated.`,
    );
  }

  return message.parsed_output as ExtractedResume;
}

function writeYamlFile(relativePath: string, data: unknown) {
  const body = dumpYaml(data, { lineWidth: -1 });
  writeFileSync(join(HOME_DIR, relativePath), body);
}

function writeSummaryMd(name: string, title: string, summary: string) {
  const frontmatter = dumpYaml({ name, title }, { lineWidth: -1 }).trimEnd();
  const content = `---\n${frontmatter}\n---\n\n${summary.trim()}\n`;
  writeFileSync(join(HOME_DIR, "summary.md"), content);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filePathArg = args.find((a) => !a.startsWith("--"));

  if (!filePathArg) {
    console.error(
      "Usage: npm run generate:resume -- path/to/resume.pdf [--dry-run]\n" +
        "Accepts .pdf, .txt, or .md.",
    );
    process.exitCode = 1;
    return;
  }

  const filePath = resolve(process.cwd(), filePathArg);
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Reading ${filePath}...`);
  console.log("Extracting with Claude (this can take a little while)...");

  let extracted: ExtractedResume;
  try {
    extracted = await extractResume(filePath);
  } catch (error) {
    const message = (error as Error).message ?? String(error);
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error: ${message}`);
    } else if (message.includes("Could not resolve authentication method")) {
      console.error(
        "Couldn't find Claude API credentials. Either run `ant auth login` (uses your Claude.ai " +
          "Pro/Max subscription) or set ANTHROPIC_API_KEY in your environment.",
      );
    } else {
      console.error(message);
    }
    process.exitCode = 1;
    return;
  }

  // Re-validate every section against the same schemas the site's own build
  // pipeline uses, so a mistake here fails loudly now instead of silently
  // breaking `npm run build` later.
  const skills = skillsSchema.parse(extracted.skills);
  const education = educationSchema.parse(extracted.education);
  const experience = experienceSchema.parse(extracted.experience);
  const credentials = credentialsSchema.parse(
    (extracted.credentials as Array<Record<string, unknown>>).map((c) => ({
      ...c,
      url: c.url ?? undefined,
    })),
  );
  const volunteer = volunteerSchema.parse(extracted.volunteer);
  const languages = languagesSchema.parse(extracted.languages);

  if (dryRun) {
    console.log("\n--dry-run: not writing files. Extracted data:\n");
    console.log(
      JSON.stringify(
        { ...extracted, skills, education, experience, credentials, volunteer, languages },
        null,
        2,
      ),
    );
    return;
  }

  mkdirSync(HOME_DIR, { recursive: true });
  writeSummaryMd(extracted.name, extracted.title, extracted.summary);
  writeYamlFile("skills.yaml", skills);
  writeYamlFile("education.yaml", education);
  writeYamlFile("experience.yaml", experience);
  writeYamlFile("credentials.yaml", credentials);
  writeYamlFile("volunteer.yaml", volunteer);
  writeYamlFile("languages.yaml", languages);

  console.log(`\nWrote content/about/{summary.md,skills,education,experience,credentials,volunteer,languages}.yaml`);
  console.log("Review the output, then `npm run dev` to see it on the site.");
}

main();
