import { redirect } from "next/navigation";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.set(k, v);
  });
  const queryString = query.toString();
  redirect(queryString ? `/alumni?${queryString}` : "/alumni");
}
