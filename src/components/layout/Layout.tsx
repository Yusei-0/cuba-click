import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <main className="grow container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
