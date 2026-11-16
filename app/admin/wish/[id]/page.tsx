import { notFound } from "next/navigation";
import WishForm from "@/components/WishForm";
import { getWish } from "@/lib/queries";

export default async function EditWishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wish = await getWish(id);
  if (!wish) notFound();
  return (
    <>
      <h2 className="page-title">Redigér ønske</h2>
      <WishForm wish={wish} back={wish.suggested ? "forslag" : undefined} />
    </>
  );
}
