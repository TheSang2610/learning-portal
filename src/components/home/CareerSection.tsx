import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Code,
  BarChart3,
  Shield,
} from "lucide-react";

const careers = [
  {
    title: "Project Manager",
    description:
      "Lead teams, manage projects, and drive business success.",
    href: "/career-academy/roles/project-manager",
    icon: Briefcase,
  },
  {
    title: "Front-End Developer",
    description:
      "Build modern web applications and user interfaces.",
    href: "/career-academy/roles/front-end-developer",
    icon: Code,
  },
  {
    title: "Data Analyst",
    description:
      "Analyze data and uncover insights for businesses.",
    href: "/career-academy/roles/data-analyst",
    icon: BarChart3,
  },
  {
    title: "Cybersecurity Analyst",
    description:
      "Protect systems and networks from cyber threats.",
    href: "/career-academy/roles/cybersecurity-analyst",
    icon: Shield,
  },
];

export default function CareerSection() {
  return (
    <section className="bg-[#f5f7fa] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="flex items-end justify-between gap-6 flex-wrap">

          <div>

            <h2 className="text-4xl font-bold text-[#1f1f1f]">
              Explore careers
            </h2>

            <p className="mt-4 text-lg text-gray-600 max-w-2xl">
              Discover career paths and learn the skills
              needed to succeed in high-demand industries.
            </p>
          </div>

          <Link
            href="/career-academy"
            className="text-blue-600 font-semibold hover:underline"
          >
            View all careers
          </Link>
        </div>

        {/* CAREER CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">

          {careers.map((career) => {
            const Icon = career.icon;

            return (
              <Link
                key={career.title}
                href={career.href}
                className="group bg-white rounded-2xl p-8 border hover:border-blue-600 hover:shadow-lg transition"
              >

                {/* ICON */}
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">

                  <Icon
                    size={28}
                    className="text-blue-600"
                  />
                </div>

                {/* CONTENT */}
                <h3 className="text-2xl font-semibold text-[#1f1f1f] mt-6 group-hover:text-blue-600 transition">
                  {career.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mt-4">
                  {career.description}
                </p>

                {/* LINK */}
                <div className="flex items-center gap-2 mt-8 text-blue-600 font-semibold">

                  Explore career

                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}