import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Workers build config for the Next.js app.
 *
 * No incremental cache override: every page here is either static (served
 * straight from the asset store) or rendered per request, so there is nothing
 * to persist between invocations and no R2 bucket to pay for.
 */
export default defineCloudflareConfig();
