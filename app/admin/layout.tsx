import AdminNav from "@/components/AdminNav";
import Hero from "@/components/Hero";
import { requireOwner } from "@/lib/owner";
import { listWishes, lastMailSend } from "@/lib/queries";
import { fmtDate } from "@/components/WishCard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireOwner();
  const [wishes, last] = await Promise.all([listWishes(), lastMailSend()]);
  const active = wishes.filter((w) => w.status === "active" && !w.suggested).length;
  const sugg = wishes.filter((w) => w.status === "active" && w.suggested).length;
  return (
    <>
      <div className="topbar">
        <Hero>
          <header>
            <h1>Kåres ønskeliste</h1>
            <p>{active} aktive ønsker{last ? ` · sidste mail ${fmtDate(last.sent_at)}` : ""}</p>
          </header>
        </Hero>
        <form action="/auth/signout" method="post">
          <button className="btn ghost sm" type="submit">Log ud</button>
        </form>
      </div>
      <AdminNav suggestions={sugg} />
      <main>{children}</main>
    </>
  );
}
