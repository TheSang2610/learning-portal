export default function CategoriesSection() {
  const categories = [
    "Business",
    "Artificial Intelligence",
    "Data Science",
    "Computer Science",
    "Information Technology",
    "Personal Development",
    "Healthcare",
    "Language Learning",
    "Social Sciences",
    "Arts and Humanities",
    "Physical Science and Engineering",
    "Math and Logic",
  ];

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TITLE */}
        <div>
          <h3 className="text-sm md:text-md font-semibold text-[#1f1f1f]">
            Explore Categories
          </h3>
        </div>

        {/* FLEX WRAPPER FOR PILLS (Tự động xuống hàng, không cuộn) */}
        <div className="flex flex-wrap px-2 gap-2 mt-6">
          {categories.map((category, index) => (
            <div
              // Dùng thêm index kết hợp với name để tránh trùng lặp key nếu mảng có phần tử trùng nhau
              key={`${category}-${index}`}
              className="min-w-fit bg-[#f0f6ff] rounded-full border border-gray-200 px-4 py-2 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-400 transition duration-200 cursor-pointer select-none"
            >
              <span className="text-sm md:text-md font-medium text-gray-800 whitespace-nowrap">
                {category}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}