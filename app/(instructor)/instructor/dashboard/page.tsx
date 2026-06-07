// "use client";

// import { useEffect, useState } from "react";
// import { getDashboardStatistics } from "@/src/services/adminService";

// export default function AdminDashboardPage() {
//   const [stats, setStats] = useState<any>(null);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const data = await getDashboardStatistics();
//         setStats(data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchStats();
//   }, []);

//   if (!stats) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1 className="text-4xl font-bold mb-8">
//         Admin Dashboard
//       </h1>

//       <div className="grid grid-cols-4 gap-6">

//         <div className="bg-white rounded-2xl p-6 shadow">
//           <h2 className="text-gray-500 text-sm">
//             Total Users
//           </h2>

//           <p className="text-3xl font-bold mt-2">
//             {stats.users.total}
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow">
//           <h2 className="text-gray-500 text-sm">
//             Courses
//           </h2>

//           <p className="text-3xl font-bold mt-2">
//             {stats.courses.total}
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow">
//           <h2 className="text-gray-500 text-sm">
//             Enrollments
//           </h2>

//           <p className="text-3xl font-bold mt-2">
//             {stats.enrollments.total}
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow">
//           <h2 className="text-gray-500 text-sm">
//             Certificates
//           </h2>

//           <p className="text-3xl font-bold mt-2">
//             {stats.certificates.total}
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }