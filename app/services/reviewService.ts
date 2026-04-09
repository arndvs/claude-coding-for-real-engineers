import { eq, and, sql } from "drizzle-orm";
import { db } from "~/db";
import { courseReviews, enrollments } from "~/db/schema";

// ─── Review Service ───
// Handles course star ratings. One review per user per course.
// Uses positional parameters (project convention).

export function getReviewByUserAndCourse(userId: number, courseId: number) {
  return db
    .select()
    .from(courseReviews)
    .where(
      and(
        eq(courseReviews.userId, userId),
        eq(courseReviews.courseId, courseId)
      )
    )
    .get();
}

export function getAverageRating(courseId: number) {
  const result = db
    .select({
      avgRating: sql<number>`avg(${courseReviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId))
    .get();

  if (!result || result.count === 0) {
    return { avgRating: null, count: 0 };
  }

  return {
    avgRating: Math.round(result.avgRating * 10) / 10,
    count: result.count,
  };
}

export function getAverageRatingsForCourses(courseIds: number[]) {
  if (courseIds.length === 0) return new Map<number, { avgRating: number; count: number }>();

  const results = db
    .select({
      courseId: courseReviews.courseId,
      avgRating: sql<number>`avg(${courseReviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseReviews)
    .groupBy(courseReviews.courseId)
    .all();

  const map = new Map<number, { avgRating: number; count: number }>();
  for (const row of results) {
    map.set(row.courseId, {
      avgRating: Math.round(row.avgRating * 10) / 10,
      count: row.count,
    });
  }
  return map;
}

export function upsertReview(userId: number, courseId: number, rating: number) {
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  const enrolled = db
    .select()
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    )
    .get();

  if (!enrolled) {
    throw new Error("User must be enrolled to review this course");
  }

  const existing = getReviewByUserAndCourse(userId, courseId);

  if (existing) {
    return db
      .update(courseReviews)
      .set({ rating })
      .where(eq(courseReviews.id, existing.id))
      .returning()
      .get();
  }

  return db
    .insert(courseReviews)
    .values({ userId, courseId, rating })
    .returning()
    .get();
}
