import type { Locker } from "../types/locker";
import { MapPin } from "lucide-react";

type Props = {
  locker: Locker & { score: number; dist?: number };
};

export default function BestLockerCard({ locker }: Props) {
  const lat = locker.location.latitude;
  const lng = locker.location.longitude;

  const openMap = () => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white border-2 border-[#FFD200] rounded-xl shadow-sm p-4 space-y-3">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Recommended locker
          </h2>
        </div>

        <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFD200] text-black font-semibold">
          TOP MATCH
        </span>
      </div>

      {/* MAIN INFO */}
      <div>
        <p className="font-semibold text-gray-900 text-sm">
          {locker.name}
        </p>
        <p className="text-xs text-gray-500">
          {locker.address.line1}
        </p>
      </div>

      {/* DISTANCE */}
      <div className="flex gap-2 text-xs">
        {locker.dist !== undefined && (
          <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-700 flex items-center gap-1">
            <MapPin size={14} className="text-[#FFD200]" />
            {locker.dist.toFixed(1)} km
          </span>
        )}
      </div>

      {/* ACTION BUTTON */}
      <button
        onClick={openMap}
        className="w-full bg-[#FFD200] text-black text-sm font-semibold py-2 rounded-lg hover:brightness-95 transition cursor-pointer flex items-center justify-center gap-2"
      >
        <MapPin size={14} />
        Open in Google Maps
      </button>
    </div>
  );
}