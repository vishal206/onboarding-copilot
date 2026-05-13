import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Onboarding Co-Pilot",
  description: "AI-powered onboarding assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Apply saved theme before first paint to avoid flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})();`,
            }}
          />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
