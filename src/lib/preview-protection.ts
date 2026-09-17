type SanityBooleanResponse = { result?: boolean | null };

const envFallback = () => process.env.PREVIEW_PASSWORD_PROTECTED === "true";

export async function isPreviewPasswordProtected() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-01";

  if (!projectId || !/^[a-z0-9-]+$/i.test(projectId)) return envFallback();

  const query = '*[_id == "siteSettings"][0].previewPasswordProtected';
  const url = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${encodeURIComponent(dataset)}`,
  );
  url.searchParams.set("query", query);

  const headers: HeadersInit = {};
  if (process.env.SANITY_API_READ_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SANITY_API_READ_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 30, tags: ["sanity", "preview-protection"] },
    });
    if (!response.ok) return envFallback();
    const payload = (await response.json()) as SanityBooleanResponse;
    return typeof payload.result === "boolean" ? payload.result : envFallback();
  } catch {
    return envFallback();
  }
}
