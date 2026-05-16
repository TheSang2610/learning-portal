"use client";

import Link from "next/link";

export default function GovernmentHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-12">

          {/* LOGO */}
          <Link
            href="/government"
            className="flex items-center gap-3 shrink-0"
          >
            <span className="text-[38px] font-bold text-green-600">
              coursera
            </span>

            <span className="text-gray-500 text-lg whitespace-nowrap">
              for government
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-gray-700">

            <Link
              href="/government/why-coursera"
              className="hover:text-green-600 transition"
            >
              Why Coursera
            </Link>

            <Link
              href="/government/solutions"
              className="hover:text-green-600 transition"
            >
              Solutions
            </Link>

            <Link
              href="/government/resources"
              className="hover:text-green-600 transition"
            >
              Resources
            </Link>

            <Link
              href="/government/teams"
              className="hover:text-green-600 transition"
            >
              For Teams
            </Link>

            <Link
              href="/government/compare-plans"
              className="hover:text-green-600 transition"
            >
              Compare Plans
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center">

          <button className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2.5 rounded-md text-sm font-medium">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}