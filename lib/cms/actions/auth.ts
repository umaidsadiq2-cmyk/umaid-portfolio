"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthState = { error: string | null };

const credentials = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  // Only relative paths — an absolute URL here would be an open redirect.
  next: z
    .string()
    .optional()
    .transform((v) => (v && v.startsWith("/") && !v.startsWith("//") ? v : "/admin")),
});

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately generic: distinguishing "no such user" from "wrong password"
    // would let someone enumerate valid admin emails.
    return { error: "Incorrect email or password." };
  }

  redirect(parsed.data.next);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
