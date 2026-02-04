export const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authFetch = (url, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    ...getAuthHeaders(),
  };
  return fetch(url, { ...options, headers });
};
