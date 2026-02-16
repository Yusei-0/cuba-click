import { BottomNavigation } from "../ui/BottomNavigation";

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

export function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20"> {/* Add padding bottom to body to prevent content hiding behind nav */}
      <main className="w-full max-w-md mx-auto">
        {children}
      </main>
      
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto">
           <BottomNavigation />
        </div>
      )}
    </div>
  );
}
