const auth0Enabled = process.env.NEXT_PUBLIC_AUTH0_ENABLED === 'true';

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Create an account</p>
      <h1 className="mt-4 text-3xl font-bold">Choose how you will use the marketplace.</h1>
      <p className="mt-4 text-slate-700">
        Buyers discover homes. Sellers publish and manage their own property listings.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {['Buyer', 'Seller'].map((role) => (
          <section className="rounded-lg border border-slate-200 bg-white p-5" key={role}>
            <h2 className="text-xl font-semibold">{role}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {role === 'Buyer' ? 'Search active listings and save favorites.' : 'Create and publish listings after verification.'}
            </p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        {auth0Enabled
          ? 'Sign-up is available through the configured identity provider.'
          : 'Sign-up is not available until the identity provider is configured.'}
      </p>
    </main>
  );
}
