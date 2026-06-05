import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(64).optional(),
});

export const subscribe = createServerFn({ method: "POST" })
  .inputValidator((input) => SubscribeSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("subscribers")
      .upsert(
        { email: data.email, source: data.source ?? "site", status: "active" },
        { onConflict: "email" },
      );
    if (error) {
      console.error("subscribe error", error);
      return { ok: false as const, error: "Could not subscribe. Try again." };
    }
    return { ok: true as const };
  });
