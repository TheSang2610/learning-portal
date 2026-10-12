import { PORTAL_LAYOUT as C } from "@/src/constants/portal/layout";
import type { Category } from "@/src/services/categoryService";
import type { Course } from "@/src/services/course";
import type { ProviderData } from "@/src/services/provider";
import { hoacNull, fetchFromServer } from "@/src/services/serverFetch";

/**
 * Du lieu cho Footer, lay o may chu.
 *
 * Footer nam duoi MOI trang portal. Truoc day no tu goi ba API sau khi
 * hydrate, nen trang nao cung keo theo ba luot mang va ba khung xam o chan.
 *
 * Lay o day thi Next dem theo revalidate, va vi trang chu goi dung nhung
 * duong nay voi cung tham so nen hai ben dung chung mot ban dem.
 */
export async function getFooterData() {
  const [categories, homeSections, providers] = await Promise.all([
    fetchFromServer<Category[]>(C.api.categories, [], C.revalidate.categories),
    fetchFromServer<{ success?: boolean; data?: { mostPopular?: Course[] } }>(
      C.api.homeSections,
      {},
      C.revalidate.homeSections,
    ),
    fetchFromServer<ProviderData[]>(C.api.providers, [], C.revalidate.providers),
  ]);

  const popular = homeSections?.success ? (homeSections.data?.mostPopular ?? []) : [];
  const n = C.footerItems;

  return {
    initialCategories: hoacNull(categories.slice(0, n)),
    initialPopular: hoacNull(popular.slice(0, n)),
    initialProviders: hoacNull(providers.slice(0, n)),
  };
}
