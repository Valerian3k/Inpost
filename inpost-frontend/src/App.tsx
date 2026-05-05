import "./App.css";
import { useState, useMemo } from "react";
import FiltersPanel from "./components/FiltersPanel";
import BestLockerCard from "./components/BestLockerCard";
import AlternativesList from "./components/AlternativesList";
import { scoreLocker } from "./utils/scoring";
import type { Locker } from "./types/locker";
import { MapPin } from "lucide-react";

// ----------------------
// HAVERSINE
// ----------------------
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

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ----------------------
// APP
// ----------------------
export default function App() {
  const [, setPoints] = useState<Locker[]>([]);
  const [computedPoints, setComputedPoints] = useState<any[]>([]);
  const [userPos, setUserPos] =
    useState<{ lat: number; lng: number } | null>(null);

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    only247: false,
    sendOnly: false,
    returnOnly: false,
    allegro: false,
  });

  // ----------------------
  // GEO + FETCH
  // ----------------------
  async function getLocation() {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setUserPos({ lat, lng });

      try {
        const API_URL = import.meta.env.VITE_API_URL;

        const res = await fetch(`${API_URL}/api/points`);
        const data: Locker[] = await res.json();

        setPoints(data);

        const enriched = data.map((p) => ({
          ...p,
          dist: getDistance(
            lat,
            lng,
            p.location.latitude,
            p.location.longitude
          ),
        }));

        setComputedPoints(enriched);
      } catch (e) {
        console.error(e);
        setPoints([]);
        setComputedPoints([]);
      } finally {
        setLoading(false);
      }
    });
  }

  // ----------------------
  // SMART RANKING
  // ----------------------
  const { ranked, radiusUsed } = useMemo(() => {
    if (!userPos || computedPoints.length === 0) {
      return { ranked: [], radiusUsed: 0 };
    }

    // 1. LIMIT 200 CLOSEST
    const base = [...computedPoints]
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 200);

    // 2. FILTERS
    const filtered = base.filter((p) => {
      if (filters.only247 && p.opening_hours !== "24/7") return false;
      if (filters.sendOnly && !p.functions.includes("parcel_send")) return false;
      if (filters.returnOnly && !p.functions.includes("parcel_collect"))
        return false;
      if (
        filters.allegro &&
        !p.functions.some((f: string) => f.includes("allegro"))
      )
        return false;

      return true;
    });

    // 3. RADIUS LOGIC
    const radii = [15, 30, 60, 100];

    let selected: any[] = [];
    let usedRadius = 100;

    for (const r of radii) {
      const temp = filtered.filter((p) => p.dist <= r);

      if (temp.length > 0) {
        selected = temp;
        usedRadius = r;
        break;
      }
    }

    if (selected.length === 0) {
      selected = filtered;
      usedRadius = 100;
    }

    // 4. SCORE
    const ranked = selected
      .map((p) => ({
        ...p,
        score: scoreLocker(
          p,
          userPos.lat,
          userPos.lng,
          filters
        ),
      }))
      .sort((a, b) => b.score - a.score);

    return {
      ranked,
      radiusUsed: usedRadius,
    };
  }, [computedPoints, filters, userPos]);

  const top1 = ranked[0];
  const alternatives = ranked.slice(1);

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="min-h-screen bg-[#f4f6f8] px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-[#FFD200] text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Parcel Locker Finder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Find the closest and best locker near you
          </p>
        </div>

        {/* BUTTON */}
        <button
          onClick={getLocation}
          className="w-full bg-[#FFD200] text-black py-3 rounded-xl font-semibold hover:brightness-95 transition"
        >
          {loading ? "Searching..." : "Use my location"}
        </button>

        {/* FILTERS */}
        <FiltersPanel filters={filters} setFilters={setFilters} />

        {/* EMPTY */}
        {!userPos && (
          <div className="text-center text-gray-500 mt-10">
            Enable location to start searching lockers
          </div>
        )}

        {/* RESULTS INFO — ONLY WHEN FOUND */}
        {userPos && ranked.length > 0 && (
          <div className="text-sm bg-white border-2 border-[#FFD200] rounded-xl p-3 flex items-center gap-2 text-gray-800">

            <MapPin size={14} className="text-[#FFD200] " />

            <span>
              Searching within <b>{radiusUsed} km</b> • found{" "}
              <b>{ranked.length}</b> lockers
            </span>

          </div>
        )}

        {/* BEST */}
        {userPos && top1 && (
          <BestLockerCard locker={top1} />
        )}

        {/* ALTERNATIVES */}
        {userPos && alternatives.length > 0 && (
          <AlternativesList list={alternatives} />
        )}
      </div>
    </div>
  );
}