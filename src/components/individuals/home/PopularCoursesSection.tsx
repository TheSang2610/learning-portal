"use client";
import { ArrowRight, Star } from "lucide-react";

// Cấu trúc lại dữ liệu theo từng cột giống ảnh mẫu Coursera
const categoriesData = [
  {
    id: "most-popular",
    title: "Most popular",
    link: "#",
    courses: [
      {
        title: "Google Project Management",
        instructor: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
        type: "Professional Certificate",
        rating: "4.8",
      },
      {
        title: "Google Data Analytics",
        instructor: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        type: "Professional Certificate",
        rating: "4.8",
      },
      {
        title: "IBM Data Analyst",
        instructor: "IBM",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        type: "Professional Certificate",
        rating: "4.6",
      },
    ],
  },
  {
    id: "hot-releases",
    title: "Hot new releases",
    link: "#",
    courses: [
      {
        title: "Gemini for Developers",
        instructor: "Google DeepMind",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        type: "Specialization",
        rating: null,
      },
      {
        title: "Project Management and Planning",
        instructor: "Johns Hopkins University",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Stanford_Cardinal_logo.svg", // Thay bằng logo trường phù hợp
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
        type: "Specialization",
        rating: "4.7",
      },
      {
        title: "IBM Management Consultant",
        instructor: "IBM",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
        type: "Professional Certificate",
        rating: "4.7",
      },
    ],
  },
  {
    id: "trending-now",
    title: "Trending now",
    link: "#",
    courses: [
      {
        title: "Google AI",
        instructor: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        image: "https://images.unsplash.com/photo-1677442136019-21780efad99a",
        type: "Professional Certificate",
        rating: "4.8",
      },
      {
        title: "Authentic Communication With Confidence...",
        instructor: "University of London",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/University_of_Pennsylvania_logo.svg",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
        type: "Specialization",
        rating: "4.7",
      },
      {
        title: "Digital Marketing with Canva",
        instructor: "Coursera",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Coursera_logo.svg",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
        type: "Specialization",
        rating: "4.5",
      },
    ],
  },
];

export default function PopularCoursesSection() {
  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TITLE */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
            New and popular
          </h2>
        </div>

        {/* 3 COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {categoriesData.map((category) => (
            <div
              key={category.id}
              className="bg-[#ebf3ff] rounded-2xl p-4 flex flex-col gap-4"
            >
              {/* CATEGORY HEADER */}
              <a
                href={category.link}
                className="inline-flex items-center gap-1 text-base font-bold text-[#1f1f1f] hover:underline w-fit"
              >
                {category.title}
                <ArrowRight size={16} className="mt-0.5" />
              </a>

              {/* COURSE LIST (VERTICAL) */}
              <div className="flex flex-col gap-3">
                {category.courses.map((course, index) => (
                  <div
                    key={`${course.title}-${index}`}
                    className="bg-white rounded-xl p-3 flex gap-4 shadow-sm hover:shadow-md transition duration-200 cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    {/* LEFT: IMAGE (SQUARE) */}
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* RIGHT: INFO */}
                    <div className="flex flex-col justify-between min-w-0 flex-1">
                      <div>
                        {/* INSTRUCTOR + LOGO */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={course.logo}
                            alt={course.instructor}
                            className="w-3 h-3 object-contain flex-shrink-0"
                          />
                          <p className="text-xs text-gray-600 truncate">
                            {course.instructor}
                          </p>
                        </div>

                        {/* COURSE TITLE */}
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mt-1 leading-snug">
                          {course.title}
                        </h4>
                      </div>

                      {/* BADGE TYPE & RATING */}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
                        <span className="truncate">{course.type}</span>
                        {course.rating && (
                          <div className="flex items-center gap-0.5 flex-shrink-0 text-gray-700 font-medium">
                            <span className="mx-1">•</span>
                            <Star size={10} className="fill-black text-black" />
                            <span>{course.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}