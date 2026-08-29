import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { Home } from './pages/Home';
import { Wizard } from './pages/Wizard';
import { Results } from './pages/Results';
import { SchemeDetail } from './pages/SchemeDetail';
import { Bookmarks } from './pages/Bookmarks';
import { Profile } from './pages/Profile';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#fdfbf7] text-[#1c1917]">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wizard" element={<Wizard />} />
              <Route path="/results" element={<Results />} />
              <Route path="/schemes/:id" element={<SchemeDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/profile" element={<Profile />} />
              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
