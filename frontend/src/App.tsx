import { useState, useEffect } from 'react'
import TopTicker from './components/TopTicker'
import BottomNavbar from './components/BottomNavbar'
import Dashboard from './pages/Dashboard'
import Market from './pages/Market'
import Portfolio from './pages/Portfolio'
import './index.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className='bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-black shadow-2xl backdrop-blur-2xl h-screen w-full overflow-x-hidden'>
      <TopTicker />

      <main className="h-screen">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'market' && <Market />}
        {activePage === 'portfolio' && <Portfolio />}
      </main>

      <BottomNavbar activePage={activePage} onPageChange={setActivePage} />
    </div>
  )
}

export default App
