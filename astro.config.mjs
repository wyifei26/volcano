import { defineConfig } from "astro/config";

const [owner, repo] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const isProjectPage = Boolean(
  process.env.GITHUB_ACTIONS && owner && repo && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io`
);

export default defineConfig({
  site: owner ? `https://${owner}.github.io` : "https://example.github.io",
  base: isProjectPage ? `/${repo}` : undefined,
  output: "static",
  devToolbar: {
    enabled: false
  }
});
