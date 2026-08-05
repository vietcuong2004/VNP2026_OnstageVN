"use client";

import { useEffect, useMemo, useState } from "react";
import { CITY_VALUES } from "@/components/ui/ComboboxOptionValues";
import { BackendCity, loadLocationCities } from "@/lib/location-api";

export type CityOption = {
  id?: number;
  label: string;
  value: string;
  city?: BackendCity;
};

export function normalizeLocationName(value: string): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/^(tinh|thanh pho|tp\.?)\s+/i, "")
    .trim();
}

function cityLabel(city: BackendCity): string {
  return city.full_name || city.name;
}

function uniqueCityOptions(options: CityOption[]): CityOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = normalizeLocationName(option.label || option.value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useLocationCities() {
  const [cities, setCities] = useState<BackendCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadLocationCities()
      .then((items) => {
        if (isMounted) setCities(items);
      })
      .catch(() => {
        if (isMounted) setCities([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { cities, isLoading };
}

export function useCityOptions(): CityOption[] {
  const { cities } = useLocationCities();

  return useMemo(() => {
    if (cities.length > 0) {
      return uniqueCityOptions(
        cities.map((city) => {
          const label = cityLabel(city);
          return {
            id: city.id,
            label,
            value: label,
            city,
          };
        }),
      );
    }

    return uniqueCityOptions([...CITY_VALUES].map((label) => ({ label, value: label })));
  }, [cities]);
}

export function useCityLabels(): string[] {
  const options = useCityOptions();
  return useMemo(() => options.map((option) => option.label), [options]);
}

export function useCityFilterOptions(allLabel = "Toàn quốc", allValue = "Tất cả") {
  const labels = useCityLabels();

  return useMemo(
    () => [
      { label: allLabel, value: allValue },
      ...labels.map((label) => ({ label, value: normalizeLocationName(label) })),
    ],
    [allLabel, allValue, labels],
  );
}
