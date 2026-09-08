import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';

import { Home } from './pages/Home';
import { Wizard } from './pages/Wizard';
import { Results } from './pages/Results';
import { SchemeDetail } from './pages/SchemeDetail';
import { Bookmarks } from './pages/Bookmarks';
import { Profile } from './pages/Profile';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-[#fdfbf7] text-[#1c1917] pb-24 md:pb-0">
              <Navbar />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/find" element={<Wizard />} />
                  <Route path="/wizard" element={<Wizard />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/schemes/:id" element={<SchemeDetail />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/about" element={<About />} />
                  {/* Dedicated 404 Not Found Page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
              <BottomNav />
            </div>
          </Router>
        </LanguageProvider>
      </BookmarkProvider>
    </AuthProvider>
  );
};

export default App;
