"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <motion.div 
              className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="display-4 fw-bold mb-4">Cultivate Success in Qadirpur Rawan</h1>
              <p className="lead mb-4 opacity-75">
                Interactive agricultural Return on Investment (ROI) dashboard for ARB Farms. Model yields and profits for Rice, Sesame, and Wheat across different scenarios.
              </p>
            </motion.div>
            <motion.div 
              className="col-lg-6 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white p-4 rounded-circle d-inline-block shadow-lg">
                <Image
                  src="/logo.png"
                  alt="ARB Farms Logo"
                  width={200}
                  height={200}
                  className="img-fluid"
                  priority
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mb-5 pb-5 position-relative">
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Dashboard />
        </motion.div>
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
