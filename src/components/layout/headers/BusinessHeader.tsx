"use client";

import Link from "next/link";

export default function BusinessHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-12">

          {/* LOGO */}
          <Link
            href="/business"
            className="flex items-center gap-3 shrink-0"
          >
            <span className="text-[38px] font-bold text-blue-600">
              coursera
            </span>

            <span className="text-gray-500 text-lg whitespace-nowrap">
              for business
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-gray-700">

            <Link
              href="/business/why-coursera"
              className="hover:text-blue-600 transition"
            >
              Why Coursera
            </Link>

            <Link
              href="/business/solutions"
              className="hover:text-blue-600 transition"
            >
              Solutions
            </Link>

            <Link
              href="/business/resources"
              className="hover:text-blue-600 transition"
            >
              Resources
            </Link>

            <Link
              href="/business/teams"
              className="hover:text-blue-600 transition"
            >
              For Teams
            </Link>

            <Link
              href="/business/compare-plans"
              className="hover:text-blue-600 transition"
            >
              Compare Plans
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center">

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2.5 rounded-md text-sm font-medium">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}