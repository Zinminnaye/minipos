import http from "./http";

/* ========= AUTH ========= */
export const AuthAPI = {
  login: (payload) => http.post("/auth/login", payload),
  profile: () => http.get("/auth/me"),
};

/* ========= USERS ========= */
export const ProductAPI = {
  list: (params) => http.get("/Stock/SelectAll", { params }),
  get: (lastUpdatedDate) => http.get(`/Stock/SelectByLastUpdatedDate/${lastUpdatedDate}`), 
};

/* ========= FILE UPLOAD (PRO) ========= */
export const UploadAPI = {
  file: (file, onProgress) => {
    const form = new FormData();
    form.append("file", file);

    return http.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    });
  },
};
