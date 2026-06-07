"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  const menus = [
    {
      title: "For Individuals",
      href: "/",
    },
    {
      title: "For Businesseses",
      href: "/businesses",
    },
    {
      title: "For Universities",
      href: "/campus",
    },
    {
      title: "For Governments",
      href: "/government",
    },
  ];

  return (
    <div className="bg-[#0b0f19] text-white border-b border-[#1d2230]">
      <div className="max-w-7xl mx-auto flex items-center h-10 px-6">

        {menus.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                h-full px-6 flex items-center text-sm font-semibold transition relative
                ${
                  active
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }
              `}
            >
              {item.title}

              {active && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}