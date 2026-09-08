"use client";

import { useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { bucketFor, buildStoragePath } from "./storage";
import type { Section } from "./types";

export type UploadKind = "logo" | "bg" | "slide" | "thumb" | "video";

export type Uploaded = {
  url: string;
  width: number;
  height: number;
};

/**
 * Read an image's intrinsic size in the browser.
 *
 * Worth the round trip: storing real dimensions lets the public grid reserve
 * exact space per tile, which is what keeps CLS at zero. Falls back to the
 * portrait default rather than failing the upload.
 */
function measure(file: File): Promise<{ width: number; height: number }> {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve({ width: 1080, height: 1350 });
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth || 1080, height: img.naturalHeight || 1350 });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 1080, height: 1350 });
    };
    img.src = url;
  });
}

/**
 * Direct browser → Supabase Storage uploads.
 *
 * Deliberately not routed through a Server Action: Actions cap request bodies
 * at ~4.5MB on Vercel, which a single poster can exceed. The browser client
 * carries the admin session, so Storage RLS still authorises every write.
 */
export function useUploader() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: File,
      opts: { section: Section; brandSlug: string; kind: UploadKind },
    ): Promise<Uploaded | null> => {
      setBusy(true);
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const bucket = bucketFor(opts.kind);
        const path = buildStoragePath({ ...opts, file });

        const [{ error: uploadError }, dimensions] = await Promise.all([
          supabase.storage.from(bucket).upload(path, file, {
            cacheControl: "31536000",
            upsert: false,
          }),
          measure(file),
        ]);

        if (uploadError) {
          setError(
            /exceeded the maximum allowed size/i.test(uploadError.message)
              ? "That file is too large for this bucket."
              : uploadError.message,
          );
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(path);

        return { url: publicUrl, ...dimensions };
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Upload failed.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  /** Upload several files, preserving the order they were selected in. */
  const uploadMany = useCallback(
    async (
      files: File[],
      opts: { section: Section; brandSlug: string; kind: UploadKind },
    ): Promise<Uploaded[]> => {
      const out: Uploaded[] = [];
      for (const file of files) {
        const result = await upload(file, opts);
        if (result) out.push(result);
      }
      return out;
    },
    [upload],
  );

  return { upload, uploadMany, busy, error, setError };
}
