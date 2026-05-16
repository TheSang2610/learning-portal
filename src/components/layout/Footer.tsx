export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            LearningPortal
          </h2>

          <p className="mt-4 text-sm">
            Online learning platform built with Next.js
            and Node.js.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold text-white mb-4">
            Explore
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Courses</li>
            <li>Categories</li>
            <li>Instructors</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-white mb-4">
            Company
          </h3>

          <ul className="space-y-2 text-sm">
            <li>About</li>
            <li>Contact</li>
            <li>Careers</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-white mb-4">
            Support
          </h3>

          <ul className="space-y-2 text-sm">
            <li>Help Center</li>
            <li>Terms</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-sm">
        © 2026 LearningPortal. All rights reserved.
      </div>
    </footer>
  );
}