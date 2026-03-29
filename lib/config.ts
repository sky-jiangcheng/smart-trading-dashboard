// App configuration
export const config = {
  // Admin console URL
  adminUrl:
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3002"
      : "https://smart-trading-admin.vercel.app"),

  // API base URL
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://smart-trading-api.vercel.app",
};
