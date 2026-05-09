import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key for storage operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Upload a file buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error(`[STORAGE_UPLOAD] bucket=${bucket} path=${path}`, error);
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}
