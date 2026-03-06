import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  // currentUser() reads the logged-in user on the server
  const user = await currentUser();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Onboarding Co-Pilot</h1>
        <UserButton />
      </nav>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user?.firstName} 👋
        </h2>
        <p className="text-gray-500 mb-8">
          {`You're logged in as ${user?.emailAddresses[0].emailAddress}`}
        </p>

        {/* Placeholder cards — you'll fill these in later */}
        <div className="grid grid-cols-3 gap-6">
          {["Your Bots", "Documents", "Analytics"].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-gray-700">{item}</h3>
              <p className="text-gray-400 text-sm mt-1">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
