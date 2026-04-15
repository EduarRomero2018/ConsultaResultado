import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Upload from './pages/Upload';
import Search from './pages/Search';
import Login from './pages/Login';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
    return (
        <Router>
            <div className="min-h-screen w-full relative">
                {/* Radial Gradient Background from Bottom */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #2f2e67 100%)",
                    }}
                />
                <div className="relative z-10 min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full p-0">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/upload" element={<Upload />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/" element={<Navigate to="/search" replace />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </div>
        </Router>
    );
}

export default App;
