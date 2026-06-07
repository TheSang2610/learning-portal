"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "@/src/components/auth/AuthModal";
import HeroSection from "@/src/components/home/HeroSection";
import PartnersSection from "@/src/components/home/PartnersSection";
import CategoriesSection from "@/src/components/home/CategoriesSection";
import PopularCoursesSection from "@/src/components/home/PopularCoursesSection";
import FaqSection  from "@/src/components/home/FaqSection";
import TestimonialsSection from "@/src/components/home/TestimonialsSection";
// import CareerSection from "@/src/components/home/CareerSection";
import CourseSection from "@/src/components/home/CourseSection";
// import CourseDetailPage from "./individuals/courses/[slug]/page";

function HomeContent() {
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
        {/* <CareerSection /> */}
        <CourseSection />
        <TestimonialsSection />
        <FaqSection  />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}