import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import ChatPanel from "@/components/ChatPanel";

export const metadata: Metadata = {
  title: "EcoVest — Portfolio Greenifier",
  description:
    "Analyze a stock/ETF portfolio and get an illustrative clean-energy reallocation, powered by Gemini.",
  icons: {
    icon: [{ url: "/GROWiconNBG.png?v=2", type: "image/png" }],
    shortcut: [{ url: "/GROWiconNBG.png?v=2", type: "image/png" }],
    apple: [{ url: "/GROWiconNBG.png?v=2", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand-50 font-sans antialiased">
        <ToastProvider>
          {children}
          <ChatPanel />
        </ToastProvider>
      </body>
    </html>
  );
}
