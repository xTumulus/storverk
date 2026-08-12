# Future development

## Deployment automation

- **CI/CD deploy job.** Deploys to the EC2 instance are currently manual
  (`git pull` over SSH; `docker compose up --build -d` for code changes —
  see README's "Deploying (Docker)" section). Once that flow has been
  exercised a few times, add a deploy job to `.github/workflows/ci.yml`
  that SSHes into the instance and runs the same commands on push to
  `main`.
- **Infrastructure as code.** The EC2 instance, security group, and
  Elastic IP were provisioned manually via the AWS console. Once that
  setup has been run and validated once by hand, replace it with
  Terraform (or similar) so the infrastructure is reproducible and
  version-controlled.
- **Docker Hub.** Consider adding docker image to docker hub, but this does
  lose the ability to live update, so either fix that or accept the missing
  feature for ease of deployment.

## Features

- **More LLM provider integrations.** The "LLM career assistant" is
  currently just a disabled placeholder (`llm.enabled` in
  `content/site.config.yaml`, `src/components/LlmSlot.vue`). Add support
  for multiple providers (OpenAI, xAI, Gemini, etc.) so users can bring
  whichever subscription or API key they already have, rather than being
  locked to one.
- **Local LLM integration for generating from resume.** Explore running a
  local model to generate site content (e.g. About/experience copy) from
  a resume, as an alternative to a hosted provider.
- **Section visibility/opt-out.** Go over the site's capabilities for
  hiding or not using individual sections (e.g. volunteer, language,
  hobbies) — similar in spirit to the `llm.enabled` toggle — so sections
  that don't apply to a given user can be cleanly turned off.