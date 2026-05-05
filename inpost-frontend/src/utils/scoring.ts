import type { Locker } from "../types/locker";

// Calculate distance between two coordinates using the Haversine formula (km)
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Earth radius in kilometers

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

// Compute a ranking score for a locker based on distance and features
export function scoreLocker(
  locker: Locker,
  userLat: number,
  userLng: number,
  filters: any
) {
  // Hard filtering: exclude lockers that do not meet active filters
  if (filters.only247 && locker.opening_hours !== "24/7") return -Infinity;

  if (filters.sendOnly && !locker.functions.includes("parcel_send"))
    return -Infinity;

  if (filters.returnOnly && !locker.functions.includes("parcel_collect"))
    return -Infinity;

  if (
    filters.allegro &&
    !locker.functions.some((f) => f.includes("allegro"))
  ) {
    return -Infinity;
  }

  // Distance from user
  const dist = getDistance(
    userLat,
    userLng,
    locker.location.latitude,
    locker.location.longitude
  );

  // Distance score (dominant factor)
  // Closer lockers receive higher scores in range 0–100
  const maxDistance = 50; // cutoff distance in km
  const distanceScore = Math.max(
    0,
    100 - (dist / maxDistance) * 100
  );

  // Feature-based bonus score
  let featureScore = 0;

  if (locker.opening_hours === "24/7") featureScore += 40;
  if (locker.functions.includes("parcel_send")) featureScore += 20;
  if (locker.functions.includes("parcel_collect")) featureScore += 20;
  if (locker.functions.some((f) => f.includes("allegro")))
    featureScore += 20;

  // Final weighted score
  // Distance has higher importance than features
  return distanceScore * 0.9 + featureScore * 0.1;
}