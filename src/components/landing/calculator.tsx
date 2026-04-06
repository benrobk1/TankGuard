"use client";

import { useState } from "react";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

export function ComplianceCostCalculator() {
  const [tankCount, setTankCount] = useState(5);
  const [state, setState] = useState("Texas");

  const consultantCost = Math.min(2500 + 500 * tankCount, 15000);
  const tankGuardCost = 1188;
  const savings = consultantCost - tankGuardCost;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Compliance Cost Calculator
      </h3>
      <p className="text-gray-500 text-center mb-8">
        See how much you could save by switching to TankGuard.
      </p>

      <div className="space-y-6">
        {/* Tank count */}
        <div>
          <label
            htmlFor="tank-count"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Number of tanks: <span className="font-bold text-gray-900">{tankCount}</span>
          </label>
          <input
            id="tank-count"
            type="range"
            min={1}
            max={50}
            value={tankCount}
            onChange={(e) => setTankCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        {/* State select */}
        <div>
          <label
            htmlFor="state-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            State
          </label>
          <select
            id="state-select"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 appearance-none bg-white"
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estimated annual consultant cost</span>
            <span className="text-lg font-semibold text-gray-900">
              ${consultantCost.toLocaleString()}/yr
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">TankGuard annual cost</span>
            <span className="text-lg font-semibold text-blue-600">
              ${tankGuardCost.toLocaleString()}/yr
            </span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
              <p className="text-sm font-medium text-green-700 mb-1">Your annual savings</p>
              <p className="text-4xl font-bold text-green-600">
                ${savings.toLocaleString()}/yr
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-8 py-3 text-base font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Save ${savings.toLocaleString()}/year with TankGuard
          </a>
        </div>
      </div>
    </div>
  );
}
