import { apiJson } from "@/lib/api-client";

export type BackendCity = {
  id: number;
  code?: string | null;
  name: string;
  full_name?: string | null;
  type?: string | null;
};

export type BackendDistrict = {
  id: number;
  city_id: number;
  code?: string | null;
  name: string;
  full_name?: string | null;
  type?: string | null;
};

type LocationListResponse<T> = {
  data?: T[];
};

export async function loadLocationCities(): Promise<BackendCity[]> {
  const response = await apiJson<LocationListResponse<BackendCity>>("/locations/cities", {
    clearAuthOnUnauthorized: false,
  });

  return Array.isArray(response.data) ? response.data : [];
}

export async function loadLocationDistricts(cityId: number | string): Promise<BackendDistrict[]> {
  const response = await apiJson<LocationListResponse<BackendDistrict>>(`/locations/cities/${cityId}/districts`, {
    clearAuthOnUnauthorized: false,
  });

  return Array.isArray(response.data) ? response.data : [];
}
