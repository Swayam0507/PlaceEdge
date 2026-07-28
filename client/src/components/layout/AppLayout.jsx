import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import TopNav from "./TopNav";
import MobileBottomNav from "./MobileBottomNav";
import CommandPalette from "./CommandPalette";
import AdminSidebar from "./AdminSidebar";
import { Toaster } from "react-hot-toast";

const AppLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isAdmin = user?.role === "admin";

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <TopNav onOpenCommandPalette={() => setCmdOpen(true)} />
      <div className="flex flex-1 relative">
        {isAuthenticated && isAdmin && (
          <AdminSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
          />
        )}
        <main className={`flex-1 w-full pb-20 md:pb-8 pt-6 ${isAdmin ? 'px-4' : 'max-w-7xl mx-auto px-4 sm:px-6'}`}>
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '0.875rem',
            padding: '12px 16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
};

export default AppLayout;
