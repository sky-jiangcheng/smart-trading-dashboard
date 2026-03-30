// App configuration
const DEFAULT_ADMIN_URL = "https://smart-trading-admin.vercel.app";
const DEFAULT_API_URL = "https://smart-trading-api.vercel.app";

function resolveAdminUrl() {
  const configured = process.env.NEXT_PUBLIC_ADMIN_URL?.trim();
  if (!configured) return DEFAULT_ADMIN_URL;
  return configured;
}

function resolveApiUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) return DEFAULT_API_URL;
  return configured;
}

export const config = {
  // Admin console URL
  adminUrl: resolveAdminUrl(),

  // API base URL
  apiUrl: resolveApiUrl(),
};
