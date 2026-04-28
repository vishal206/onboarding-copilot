import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 max-w-md w-full text-center shadow-sm">
        <div className="text-5xl mb-6">🤝</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">No worries!</h1>
        <p className="text-gray-500 mb-8">
          You can upgrade anytime from the pricing page whenever you&apos;re
          ready.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            View Plans
          </Link>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
