"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService"; // Import service danh mục

export default function CreateCoursePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: "", // Sẽ lưu _id của danh mục được chọn từ select menu
    level: "beginner",
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // State lưu danh sách categories đổ từ API
  const [loadingCategories, setLoadingCategories] = useState(true); // Trạng thái tải danh mục khi vừa vào trang

  // Lấy danh sách danh mục khi trang vừa tải xong
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
        alert("Failed to load categories data");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategoriesData();
  }, []);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "price"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      return alert("Please select a category");
    }

    try {
      setLoading(true);

      const course = await createCourse(formData);

      alert("Course created");

      router.push(`/admin/courses/${course._id}`);
    } catch (error) {
      console.error(error);
      alert("Create course failed");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return <div className="p-8 text-center font-medium">Loading form setup...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Create Course</h1>

      <form
        onSubmit={submitHandler}
        className="bg-white rounded-3xl p-8 shadow-sm border space-y-5"
      >
        <div>
          <label className="block mb-2 font-medium text-slate-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={changeHandler}
            className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={changeHandler}
            rows={5}
            className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={changeHandler}
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={changeHandler}
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition bg-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* THAY THẾ CHỖ NÀY: Từ input text sang select option */}
        <div>
          <label className="block mb-2 font-medium text-slate-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={changeHandler}
            className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition bg-white text-slate-800"
            required
          >
            <option value="">-- Select Category --</option>
            {categories &&
              categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <button
          disabled={loading}
          className={`text-white px-6 py-4 rounded-2xl font-medium transition ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}