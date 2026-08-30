import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  skipProxyUrlNormalize: true,

  // Cac path "cha" chi co layout, khong co page rieng -> redirect thay vi 404.
  // Lam o tang config nen la redirect HTTP that (khong can doi JS, khong nhay man hinh).
  async redirects() {
    return [
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
      { source: "/user", destination: "/user/profile", permanent: false },
    ];
  },
};

export default nextConfig;
