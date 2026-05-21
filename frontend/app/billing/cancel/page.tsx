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
            href="/pricing" target="_blank" rel="noopener noreferrer"
            className="inline-block bg-ember text-white font-medium px-6 py-3 rounded-full text-[14px] hover:opacity-80 transition-opacity"
          >
            View Plans
          </Link>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-ink font-medium px-6 py-3 rounded-full text-[14px] border border-line-2 hover:bg-muted transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
