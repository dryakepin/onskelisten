"use client";

import { useState, useTransition } from "react";
import { lookupProduct, saveWish } from "@/app/admin/actions";
import { guessCurrency } from "@/lib/price";
import { CATEGORIES, CURRENCIES, PRIORITIES, type Wish } from "@/lib/types";

export default function WishForm({ wish, back }: { wish?: Wish; back?: "forslag" }) {
  const [url, setUrl] = useState(wish?.url ?? "");
  const [title, setTitle] = useState(wish?.title ?? "");
  const [amount, setAmount] = useState(wish?.price_amount != null ? String(wish.price_amount).replace(".", ",") : "");
  const [currency, setCurrency] = useState<string>(wish?.currency ?? "DKK");
  const [fromShop, setFromShop] = useState(false);
  const [status, setStatus] = useState("");
  const [pending, start] = useTransition();

  const lookup = () =>
    start(async () => {
      setStatus("Henter…");
      const r = await lookupProduct(url);
      if (r.url) setUrl(r.url);
      if (r.title && !title) setTitle(r.title.slice(0, 200));
      if (r.amount != null) {
        setAmount(String(r.amount).replace(".", ","));
        setCurrency(r.currency ?? guessCurrency(url));
        setFromShop(true);
        setStatus("Pris hentet fra butikken.");
      } else {
        setStatus(r.error === "not a product page" ? "Det ligner en søgeside – skriv prisen selv." : "Fandt ingen pris på siden – skriv den selv.");
      }
    });

  const occ = wish?.occasions ?? ["jul", "fødselsdag"];
  return (
    <form action={saveWish} className="panel">
      {wish && <input type="hidden" name="id" value={wish.id} />}
      {back && <input type="hidden" name="back" value={back} />}
      {fromShop && <input type="hidden" name="price_from_shop" value="1" />}
      <label htmlFor="url">Link (valgfrit)</label>
      <div className="row-inline">
        <input id="url" name="url" type="url" placeholder="https://…" value={url}
          onChange={(e) => { setUrl(e.target.value); if (!amount) setCurrency(guessCurrency(e.target.value)); }} />
        <button type="button" className="btn" onClick={lookup} disabled={!url || pending}>Hent fra link</button>
      </div>
      {status && <div className="status">{status}</div>}
      <label htmlFor="title">Hvad ønsker du?</label>
      <input id="title" name="title" required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="row">
        <div>
          <label htmlFor="price">Pris (valgfrit)</label>
          <div className="row-inline">
            <input id="price" name="price_amount" inputMode="decimal" placeholder="fx 400" value={amount}
              onChange={(e) => { setAmount(e.target.value); setFromShop(false); }} />
            <select name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Valuta" style={{ width: 90 }}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="category">Kategori</label>
          <select id="category" name="category" defaultValue={wish?.category ?? "andet"}>
            {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>
      <label htmlFor="note">Note til familien (størrelse, farve, alternativer…)</label>
      <textarea id="note" name="note" maxLength={600} defaultValue={wish?.note ?? ""} />
      <label>Hvor gerne?</label>
      <div className="chips">
        {Object.entries(PRIORITIES).map(([k, l]) => (
          <label key={k}><input type="radio" name="priority" value={k} defaultChecked={String(wish?.priority ?? 2) === k} /> {l}</label>
        ))}
      </div>
      <label>Anledning</label>
      <div className="chips">
        <label><input type="checkbox" name="occasions" value="jul" defaultChecked={occ.includes("jul")} /> Jul</label>
        <label><input type="checkbox" name="occasions" value="fødselsdag" defaultChecked={occ.includes("fødselsdag")} /> Fødselsdag</label>
      </div>
      <div className="dlg-foot">
        <a className="btn ghost" href={back === "forslag" ? "/admin/forslag" : "/admin"}>Annullér</a>
        <button className="btn primary" type="submit">Gem</button>
      </div>
    </form>
  );
}
