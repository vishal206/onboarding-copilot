import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md w-full text-center shadow-sm">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re all set!
        </h1>
        <p className="text-gray-500 mb-8">
          Your subscription is active. Head back to the dashboard to start using
          your new plan.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
