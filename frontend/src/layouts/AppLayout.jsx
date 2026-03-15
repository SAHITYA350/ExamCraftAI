import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { SearchProvider } from '../context/SearchContext';

const AppLayout = () => {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mainMarginLeft = isDesktop
    ? sidebarOpen
      ? '260px'
      : '72px'
    : '0';

  return (
    <SearchProvider>
      <div className="min-h-screen bg-dark bg-grid-pattern">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main
          className="pt-16 min-h-screen transition-all duration-300"
          style={{ marginLeft: mainMarginLeft }}
        >
          <Outlet />
        </main>
      </div>
    </SearchProvider>
  );
};

export default AppLayout;
