type Props = {
  filters: any;
  setFilters: (v: any) => void;
};

const items = [
  { label: "24/7 access", key: "only247" },
  { label: "Send parcels", key: "sendOnly" },
  { label: "Return parcels", key: "returnOnly" },
  { label: "Allegro supported", key: "allegro" },
];

export default function FiltersPanel({ filters, setFilters }: Props) {
  return (
    <div className="bg-white border-2 border-[#FFD200] rounded-xl shadow-sm p-4 space-y-3">

      {/* HEADER */}
      <div>
        <h3 className="text-base font-bold text-gray-900">
          Filters
        </h3>
        <p className="text-xs text-gray-500">
          Refine results
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {items.map((item) => {
          const active = filters[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg border-2 border-[#FFD200] bg-gray-50"
            >
              <span className="text-sm text-gray-800">
                {item.label}
              </span>

              {/* SWITCH */}
              <button
                onClick={() =>
                  setFilters({
                    ...filters,
                    [item.key]: !active,
                  })
                }
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                  active ? "bg-[#FFD200]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                    active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}