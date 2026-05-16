"use client";

import Link from "next/link";

export default function CampusHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-12">

          {/* LOGO */}
          <Link
            href="/campus"
            className="flex items-center gap-3 shrink-0"
          >
            <span className="text-[38px] font-bold text-purple-600">
              coursera
            </span>

            <span className="text-gray-500 text-lg whitespace-nowrap">
              for campus
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-gray-700">

            <Link
              href="/campus/why-coursera"
              className="hover:text-purple-600 transition"
            >
              Why Coursera
            </Link>

            <Link
              href="/campus/solutions"
              className="hover:text-purple-600 transition"
            >
              Solutions
            </Link>

            <Link
              href="/campus/resources"
              className="hover:text-purple-600 transition"
            >
              Resources
            </Link>

            <Link
              href="/campus/compare-plans"
              className="hover:text-purple-600 transition"
            >
              Compare Plans
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center">

          <button className="bg-purple-600 hover:bg-purple-700 transition text-white px-5 py-2.5 rounded-md text-sm font-medium">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}