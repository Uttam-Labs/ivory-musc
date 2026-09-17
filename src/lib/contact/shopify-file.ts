import "server-only";

import { env } from "@/lib/env";

const MAX_ATTACHMENT_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

type GraphqlError = { message: string };
type UserError = { message: string };

async function shopifyAdmin<T>(query: string, variables: Record<string, unknown>) {
  if (!env.SHOPIFY_STORE_DOMAIN || !env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error("Shopify Admin file upload is not configured.");
  }

  const response = await fetch(
    `https://${env.SHOPIFY_STORE_DOMAIN}/admin/api/${env.SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Shopify-Access-Token": env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    },
  );
  const result = await response.json() as { data?: T; errors?: GraphqlError[] };
  if (!response.ok || result.errors?.length || !result.data) {
    throw new Error(result.errors?.map(({ message }) => message).join("; ") || `Shopify Admin API failed (${response.status}).`);
  }
  return result.data;
}

const stagedUploadMutation = `
  mutation ContactAttachmentStage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { message }
    }
  }
`;

const fileCreateMutation = `
  mutation ContactAttachmentCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus }
      userErrors { message }
    }
  }
`;

export async function uploadContactAttachment(file: File, customerName: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, WEBP or HEIC image.");
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    throw new Error("The attachment must be 4MB or smaller.");
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "contact-photo";
  const staged = await shopifyAdmin<{
    stagedUploadsCreate: {
      stagedTargets: Array<{ url: string; resourceUrl: string; parameters: Array<{ name: string; value: string }> }>;
      userErrors: UserError[];
    };
  }>(stagedUploadMutation, {
    input: [{
      filename,
      mimeType: file.type,
      resource: "FILE",
      fileSize: String(file.size),
      httpMethod: "POST",
    }],
  });

  const stageResult = staged.stagedUploadsCreate;
  if (stageResult.userErrors.length || !stageResult.stagedTargets[0]) {
    throw new Error(stageResult.userErrors.map(({ message }) => message).join("; ") || "Shopify could not prepare the attachment upload.");
  }

  const target = stageResult.stagedTargets[0];
  const upload = new FormData();
  target.parameters.forEach(({ name, value }) => upload.append(name, value));
  upload.append("file", file, filename);
  const uploadResponse = await fetch(target.url, { method: "POST", body: upload });
  if (!uploadResponse.ok) throw new Error(`Attachment upload failed (${uploadResponse.status}).`);

  const created = await shopifyAdmin<{
    fileCreate: { files: Array<{ id: string; fileStatus: string }>; userErrors: UserError[] };
  }>(fileCreateMutation, {
    files: [{
      alt: `Contact enquiry attachment from ${customerName}`,
      contentType: "IMAGE",
      originalSource: target.resourceUrl,
      filename,
    }],
  });
  const createResult = created.fileCreate;
  if (createResult.userErrors.length || !createResult.files[0]?.id) {
    throw new Error(createResult.userErrors.map(({ message }) => message).join("; ") || "Shopify could not create the attachment file.");
  }

  return { id: createResult.files[0].id, filename };
}
