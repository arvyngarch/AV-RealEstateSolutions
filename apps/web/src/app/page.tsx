import Link from 'next/link';

export default function HomePage() {
  return <main className="mx-auto max-w-4xl px-6 py-20"><p className="text-sm font-semibold uppercase tracking-wide text-sky-700">AV Real Estate Solutions</p><h1 className="mt-4 text-4xl font-bold tracking-tight">Direct real-estate transactions, built for trust.</h1><p className="mt-6 max-w-2xl text-lg text-slate-700">Create listings, negotiate offers, prepare an agreement, coordinate inspections, and track the path to closing.</p><div className="mt-8 flex gap-4"><Link className="rounded bg-sky-700 px-5 py-3 text-white" href="/marketplace">Browse listings</Link><Link className="rounded border border-sky-700 px-5 py-3 text-sky-700" href="/transaction">Open transaction dashboard</Link></div></main>;
}
