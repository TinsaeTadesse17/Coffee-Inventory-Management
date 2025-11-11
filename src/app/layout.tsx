import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Esset Coffee Dashboard",
  description: "Coffee Supply Chain Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
