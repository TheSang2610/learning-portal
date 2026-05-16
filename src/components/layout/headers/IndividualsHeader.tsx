"use client";

import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

export default function IndividualsHeader() {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between gap-6">

        {/* LEFT */}
        <div className="flex items-center gap-6">

          <Link
            href="/"
            className="text-[42px] font-bold text-blue-600 tracking-tight"
          >
            coursera
          </Link>

          <button className="hidden md:flex items-center gap-1 text-sm hover:text-blue-600 transition">
            Explore
            <ChevronDown size={16} />
          </button>

          <Link
            href="/degrees"
            className="hidden md:block text-sm hover:text-blue-600 transition"
          >
            Degrees
          </Link>
        </div>

        {/* SEARCH */}
        <div className="flex-1 hidden lg:flex">
          <div className="w-full max-w-2xl relative">

            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full border border-gray-300 rounded-full py-3 pl-5 pr-14 outline-none focus:border-blue-600"
            />

            <button className="absolute right-1 top-1 bg-blue-600 text-white rounded-full w-11 h-11 flex items-center justify-center">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          <Link
            href="/login"
            className="text-sm text-blue-600 hover:underline"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-50 transition"
          >
            Join for Free
          </Link>
        </div>
      </div>
    </div>
  );
}