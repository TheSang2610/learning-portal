"use client";

import { usePathname } from "next/navigation";

import TopNav from "./TopNav";

import IndividualsHeader from "./headers/IndividualsHeader";
import BusinessHeader from "./headers/BusinessHeader";
import CampusHeader from "./headers/CampusHeader";
import GovernmentHeader from "./headers/GovernmentHeader";

export default function Header() {
  const pathname = usePathname();

  const renderHeader = () => {
    if (pathname.startsWith("/business")) {
      return <BusinessHeader />;
    }

    if (pathname.startsWith("/campus")) {
      return <CampusHeader />;
    }

    if (pathname.startsWith("/government")) {
      return <GovernmentHeader />;
    }

    return <IndividualsHeader />;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <TopNav />

      {renderHeader()}
    </header>
  );
}