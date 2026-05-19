"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/src/components/auth/AuthModal";
import HeroSection from "@/src/components/individuals/home/HeroSection";
import PartnersSection from "@/src/components/individuals/home/PartnersSection";
import CategoriesSection from "@/src/components/individuals/home/CategoriesSection";
import PopularCoursesSection from "@/src/components/individuals/home/PopularCoursesSection";
import FaqSection  from "@/src/components/individuals/home/FaqSection";
import TestimonialsSection from "@/src/components/individuals/home/TestimonialsSection";
import CareerSection from "@/src/components/individuals/home/CareerSection";

export default function HomePage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("auth")) {
      setIsAuthOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsAuthOpen(false);
    router.replace("/");
  };

  return (
    <>
      <AuthModal open={isAuthOpen} onClose={handleClose} />

      <div>
        <HeroSection />
        <CategoriesSection />
        <PopularCoursesSection />
        <PartnersSection />
        <CareerSection />
        <TestimonialsSection />
        <FaqSection  />
      </div>
    </>
  );
}