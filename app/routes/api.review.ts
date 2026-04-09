import { data } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/api.review";
import { getCurrentUserId } from "~/lib/session";
import { upsertReview } from "~/services/reviewService";
import { parseJsonBody } from "~/lib/validation";

const reviewSchema = z.object({
  courseId: z.coerce.number(),
  rating: z.coerce.number().int().min(1).max(5),
});

export async function action({ request }: Route.ActionArgs) {
  const currentUserId = await getCurrentUserId(request);
  if (!currentUserId) {
    throw data("Unauthorized", { status: 401 });
  }

  const parsed = await parseJsonBody(request, reviewSchema);

  if (!parsed.success) {
    throw data("Invalid parameters", { status: 400 });
  }

  const { courseId, rating } = parsed.data;

  const review = upsertReview(currentUserId, courseId, rating);

  return { success: true, review };
}
