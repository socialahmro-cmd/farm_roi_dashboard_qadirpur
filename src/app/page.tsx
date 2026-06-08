"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main>
      {/* Hero Section acting as the full background */}
      <section className="hero-section overflow-hidden">
        
        {/* Animated SVG Wave Background */}
        <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style={{ zIndex: 0, opacity: 0.15 }}>
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-100 h-100" style={{ position: 'absolute', bottom: 0 }}>
            <motion.path
              fill="#ffffff"
              animate={{
                d: [
                  "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,213.3C672,203,768,149,864,138.7C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                  "M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ]
              }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Minimal Navigation Bar */}
        <div className="container mb-4 position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex align-items-center bg-white bg-opacity-10 rounded-pill px-3 py-2 d-inline-flex" style={{ backdropFilter: 'blur(10px)' }}>
            <Image
              src="/logo.png"
              alt="ARB Farms Logo"
              width={40}
              height={40}
              className="rounded-circle bg-white p-1 shadow-sm"
              style={{ objectFit: 'contain' }}
            />
            <span className="ms-3 fw-bold text-white tracking-wide">Interactive ROI Dashboard</span>
          </div>
        </div>

        {/* Main Dashboard directly inside the green header */}
        <div className="container position-relative">
          <motion.div
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Dashboard />
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4">
        <div className="container">
          <p className="mb-0 opacity-75">&copy; {new Date().getFullYear()} ARB Farms. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
