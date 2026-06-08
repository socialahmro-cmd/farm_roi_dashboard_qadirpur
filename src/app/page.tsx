"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main>
      {/* Hero Section acting as the full background */}
      <section className="hero-section">
        
        {/* Minimal Navigation Bar */}
        <div className="container mb-4">
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
