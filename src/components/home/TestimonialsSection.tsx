"use client";

const testimonials = [
  {
    name: "Jessica Wong",
    role: "Google Data Analytics Learner",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    review: "Coursera helped me gain real-world skills and land a new job in tech. The flexibility made learning easy alongside work.",
  },
  {
    name: "Michael Johnson",
    role: "IBM Full Stack Developer Student",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    review: "The courses are structured extremely well and taught by industry experts. I felt confident building real projects.",
  },
  {
    name: "Sophia Martinez",
    role: "Meta Front-End Developer Learner",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    review: "I loved the hands-on learning experience and professional certificates. It gave me the confidence to switch careers.",
  },
  {
    name: "David Kim",
    role: "Cloud Architecture Graduate",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
    review: "The credentials on my resume genuinely stood out during interviews. Re-skilling here changed my entire career path.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
              Why people choose Coursera
          </h2>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              {/* TOP: REVIEW TEXT (Coursera style đặt chữ lên trước) */}
              <p className="text-sm md:text-base text-gray-700 font-medium italic leading-relaxed">
                "{item.review}"
              </p>

              {/* BOTTOM: USER PROFILE */}
              <div className="flex items-center gap-3 mt-6 border-t border-gray-100 pt-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#1f1f1f] truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.role}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}