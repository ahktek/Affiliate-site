"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePaths(paths: string[]) {
  try {
    for (const path of paths) {
      revalidatePath(path);
      console.log(`Successfully revalidated path: ${path}`);
    }
    return { success: true };
  } catch (err: any) {
    console.error("Failed to revalidate paths:", err);
    return { success: false, error: err.message || err };
  }
}
