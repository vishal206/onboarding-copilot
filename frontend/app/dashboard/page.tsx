"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import FileUpload from "@/components/FileUpload";
import { useState } from "react";
import DocumentList from "@/components/DocumentList";
import ChatWindow from "@/components/chat/ChatWindow";
import Link from "next/link";

const TEST_BOT_ID = "00000000-0000-0000-0000-000000000001";

export default function DashboardPage() {
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Onboarding Co-Pilot</h1>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:text-gray-800">
            Settings
          </Link>
          <UserButton />
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome, {user?.firstName} 👋
        </h2>
        <p className="text-gray-500 mb-8">
          {`You're logged in as ${user?.emailAddresses[0].emailAddress}`}
        </p>

        {/* Placeholder cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
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

        {/* File Upload */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Upload Documents
        </h3>
        <FileUpload
          botId={TEST_BOT_ID}
          onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
        <DocumentList botId={TEST_BOT_ID} refreshTrigger={refreshTrigger} />
        <ChatWindow botId={TEST_BOT_ID} />
      </div>
    </main>
  );
}
