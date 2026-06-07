import { apiRequest } from "./apiHelper";

export interface ProviderData {
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  type: "company" | "university";
}

export const getProviders = async (): Promise<ProviderData[]> => {
  return apiRequest("/providers", {
    method: "GET",
  });
};

export const createProviderAdmin = async (formData: FormData): Promise<ProviderData> => {
  return apiRequest("/providers", {
    method: "POST",
    body: formData,
  });
};

export const updateProviderAdmin = async (id: string, formData: FormData): Promise<ProviderData> => {
  return apiRequest(`/providers/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteProviderAdmin = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/providers/${id}`, {
    method: "DELETE",
  });
};

export const getProviderBySlug = async (slug: string): Promise<ProviderData> => {
  return apiRequest(`/providers/slug/${slug}`, {
    method: "GET",
  });
};