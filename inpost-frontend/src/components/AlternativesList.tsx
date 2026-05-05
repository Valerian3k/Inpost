import { MapPin } from "lucide-react";
import type { Locker } from "../types/locker";

type Props = {
  list: (Locker & { score: number; dist?: number })[];
};

export default function AlternativesList({ list }: Props) {
  const openMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-3 mt-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Alternative lockers
        </h3>

        <span className="text-xs text-gray-500">
          {list.length} results
        </span>
      </div>

      {/* LIST */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">

        {list.map((l, index) => (
          <div
            key={l.name}
            className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition"
          >

            <div className="flex items-start justify-between gap-3">

              {/* LEFT */}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  #{index + 2} {l.name}
                </p>

                <p className="text-xs text-gray-500">
                  {l.address.line1}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-end gap-2">

                {/* DISTANCE */}
                {l.dist !== undefined && (
                  <div className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">

                  <MapPin size={14} className="text-[#FFD200]" />

                  <span>
                    {l.dist.toFixed(1)} km
                  </span>

                </div>
                )}

                {/* NAV BUTTON */}
                <button
                  onClick={() =>
                    openMap(
                      l.location.latitude,
                      l.location.longitude
                    )
                  }
                  className="w-full text-center text-[11px] px-3 py-1 rounded-lg bg-[#FFD200] text-black font-semibold hover:brightness-95 transition cursor-pointer"
                >
                  Navigate →
                </button>

              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}