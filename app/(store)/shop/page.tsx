import { redirect } from "next/navigation";

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = new URLSearchParams();

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (Array.isArray(val)) {
        for (const item of val) {
          search.append(key, item);
        }
      } else if (val) {
        search.append(key, val);
      }
    }
  }

  const query = search.toString();
  redirect(query ? `/products?${query}` : "/products");
}
