'use client';

import { FormEvent, useEffect, useState } from 'react';

const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type Listing = { id: string; address: string; bedrooms: number; bathrooms: number; squareFeet: number; askingPrice: string; description: string; photos: { id: string; fileName: string }[] };

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [message, setMessage] = useState('');
  async function search(event?: FormEvent) {
    event?.preventDefault();
    const response = await fetch(`${api}/listings?query=${encodeURIComponent(query)}`);
    const result = await response.json();
    setListings(result);
    setMessage(result.length ? '' : 'No matching properties are available.');
  }
  useEffect(() => { void search(); }, []);
  async function saveFavorite(id: string) {
    const response = await fetch(`${api}/favorites/${id}`, { method: 'POST', headers: { 'x-dev-role': 'BUYER' } });
    setMessage(response.ok ? 'Saved to your favorites.' : 'Unable to save this listing.');
  }
  return <main className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Find a property</h1><form className="mt-6 flex gap-3" onSubmit={search}><input className="w-full rounded border p-3" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by address"/><button className="rounded bg-sky-700 px-5 text-white">Search</button></form>{message && <p className="mt-5 text-slate-700">{message}</p>}<div className="mt-8 grid gap-5 md:grid-cols-2">{listings.map((listing) => <article className="rounded-lg border bg-white p-5" key={listing.id}><h2 className="text-xl font-semibold">{listing.address}</h2><p className="mt-2">{listing.bedrooms} beds · {listing.bathrooms} baths · {listing.squareFeet.toLocaleString()} sq ft</p><p className="mt-2 font-semibold">${Number(listing.askingPrice).toLocaleString()}</p><p className="mt-3 text-slate-700">{listing.description}</p><p className="mt-3 text-sm text-slate-500">{listing.photos.length} listing photos</p><button onClick={() => void saveFavorite(listing.id)} className="mt-4 rounded border border-sky-700 px-4 py-2 text-sky-700">Save favorite</button></article>)}</div></main>;
}
