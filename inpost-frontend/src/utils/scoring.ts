import type { Locker } from "../types/locker";

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function scoreLocker(
  locker: Locker,
  userLat: number,
  userLng: number,
  filters: any
) {
  // ❌ filtrowanie twarde
  if (filters.only247 && locker.opening_hours !== "24/7") return -Infinity;
  if (filters.sendOnly && !locker.functions.includes("parcel_send")) return -Infinity;
  if (filters.returnOnly && !locker.functions.includes("parcel_collect")) return -Infinity;

  if (
    filters.allegro &&
    !locker.functions.some((f) => f.includes("allegro"))
  ) {
    return -Infinity;
  }

  const dist = getDistance(
    userLat,
    userLng,
    locker.location.latitude,
    locker.location.longitude
  );

  // -----------------------------
  // 1. DISTANCE SCORE (DOMINUJĄCY)
  // -----------------------------
  // im bliżej, tym większy score (0–100)
  const maxDistance = 50; // 50km sensowny cutoff
  const distanceScore = Math.max(
    0,
    100 - (dist / maxDistance) * 100
  );

  // -----------------------------
  // 2. FEATURE SCORE (BONUS)
  // -----------------------------
  let featureScore = 0;

  if (locker.opening_hours === "24/7") featureScore += 40;
  if (locker.functions.includes("parcel_send")) featureScore += 20;
  if (locker.functions.includes("parcel_collect")) featureScore += 20;
  if (locker.functions.some((f) => f.includes("allegro")))
    featureScore += 20;

  // -----------------------------
  // FINAL SCORE
  // -----------------------------
  return distanceScore * 0.9 + featureScore * 0.1;
}