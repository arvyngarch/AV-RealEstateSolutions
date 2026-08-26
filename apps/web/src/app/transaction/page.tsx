'use client';

import { FormEvent, useState } from 'react';

const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function TransactionPage() {
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState<any>();
  const [message, setMessage] = useState('');

  async function load(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`${api}/transactions/${transactionId}`, {
      headers: { 'x-dev-role': 'BUYER' },
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.message ?? 'Transaction was not found.');
      return;
    }
    setTransaction(body);
    setMessage('');
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Transaction dashboard</h1>
      <form onSubmit={load} className="mt-6 flex gap-3">
        <input
          className="w-full rounded border p-3"
          value={transactionId}
          onChange={(event) => setTransactionId(event.target.value)}
          placeholder="Transaction ID"
        />
        <button className="rounded bg-sky-700 px-5 text-white">Open</button>
      </form>
      {message && <p className="mt-5 text-red-700">{message}</p>}
      {transaction && (
        <section className="mt-8 rounded-lg border bg-white p-6">
          <p>
            {transaction.closingDate
              ? `Closing date: ${new Date(transaction.closingDate).toLocaleDateString()}`
              : 'Closing date has not been set.'}
          </p>
          <h2 className="mt-6 text-xl font-semibold">Milestones</h2>
          <ul className="mt-3 space-y-3">
            {transaction.milestones.map((milestone: any) => (
              <li className="rounded border p-3" key={milestone.id}>
                <strong>{milestone.name}</strong>
                <p>Status: {milestone.status.replace('_', ' ')}</p>
                {milestone.actionRequired && <p>Next activity: {milestone.actionRequired}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
