import HeroSection from "@/src/components/individuals/home/HeroSection";
import PartnersSection from "@/src/components/individuals/home/PartnersSection";
import CategoriesSection from "@/src/components/individuals/home/CategoriesSection";
import PopularCoursesSection from "@/src/components/individuals/home/PopularCoursesSection";
import FaqSection  from "@/src/components/individuals/home/FaqSection";
import TestimonialsSection from "@/src/components/individuals/home/TestimonialsSection";
import CareerSection from "@/src/components/individuals/home/CareerSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <PopularCoursesSection />
      <PartnersSection />
      <CareerSection />
      <TestimonialsSection />
      <FaqSection  />
    </div>
  );
}