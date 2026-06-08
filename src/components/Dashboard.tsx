"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Info, Target, TrendingUp, DollarSign, Sprout, BarChart3, PieChart } from 'lucide-react';

const tabsConfig = [
  { id: 'Annual Summary', icon: BarChart3 },
  { id: 'Per-crop Breakdown', icon: Sprout },
  { id: 'Investment Analysis', icon: PieChart }
];

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LAND_COST = 9000000;

type CropParams = { yield: number; price: number; cost: number; season: string };
type Scenario = {
  rice: CropParams;
  ses: CropParams;
  wheat: CropParams;
  inflation: number;
  land_app: number;
};

const defaultScenarios: Record<'base' | 'optimistic' | 'pessimistic', Scenario> = {
  base: {
    rice:  { yield: 35, price: 4200, cost: 55000, season: 'Kharif (Jun–Oct)' },
    ses:   { yield: 300, price: 1100, cost: 30000, season: 'Kharif bridge (Jul–Oct)' },
    wheat: { yield: 30, price: 3200, cost: 42000, season: 'Rabi (Nov–Apr)' },
    inflation: 8, land_app: 6
  },
  optimistic: {
    rice:  { yield: 48, price: 5200, cost: 55000, season: 'Kharif (Jun–Oct)' },
    ses:   { yield: 450, price: 1450, cost: 30000, season: 'Kharif bridge (Jul–Oct)' },
    wheat: { yield: 42, price: 4000, cost: 42000, season: 'Rabi (Nov–Apr)' },
    inflation: 5, land_app: 10
  },
  pessimistic: {
    rice:  { yield: 24, price: 3200, cost: 60000, season: 'Kharif (Jun–Oct)' },
    ses:   { yield: 180, price: 800, cost: 32000, season: 'Kharif bridge (Jul–Oct)' },
    wheat: { yield: 20, price: 2400, cost: 46000, season: 'Rabi (Nov–Apr)' },
    inflation: 12, land_app: 3
  }
};

const fmt = (n: number, dec = 0) => {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return Math.round(n).toLocaleString();
  return n.toFixed(dec);
};
const fmtPKR = (n: number) => `PKR ${fmt(n)}`;

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'pessimistic' | 'custom'>('base');
  const [viewTab, setViewTab] = useState<string>('Annual Summary');
  const [customParams, setCustomParams] = useState<Scenario>({ ...defaultScenarios.base });

  const currentParams = activeScenario === 'custom' ? customParams : defaultScenarios[activeScenario];

  const updateCustom = (field: string, subfield: string | null, value: number) => {
    setCustomParams(prev => {
      const next = { ...prev };
      if (subfield) {
        // @ts-ignore
        next[field][subfield] = value;
      } else {
        // @ts-ignore
        next[field] = value;
      }
      return next;
    });
  };

  const calc = useMemo(() => {
    const s = currentParams;
    const rice_rev = s.rice.yield * s.rice.price;
    const ses_rev  = s.ses.yield  * s.ses.price;
    const wht_rev  = s.wheat.yield * s.wheat.price;
    const total_rev = rice_rev + ses_rev + wht_rev;
    const total_cost = s.rice.cost + s.ses.cost + s.wheat.cost;
    const net = total_rev - total_cost;

    const simple_roi = (net / LAND_COST * 100);
    const payback_yrs = net > 0 ? LAND_COST / net : Infinity;
    const land_val_10 = LAND_COST * Math.pow(1 + s.land_app / 100, 10);
    
    let total_farm_income_10 = 0;
    for (let y = 1; y <= 10; y++) {
      const factor = Math.pow(1 + (s.land_app / 100 - s.inflation / 100) / 2, y - 1);
      total_farm_income_10 += net * factor;
    }
    const total_return_10 = total_farm_income_10 + land_val_10 - LAND_COST;
    const irr_approx = (Math.pow((total_farm_income_10 + land_val_10) / LAND_COST, 1 / 10) - 1) * 100;

    return {
      rice_rev, ses_rev, wht_rev, total_rev, total_cost, net,
      rice_margin: ((rice_rev - s.rice.cost) / rice_rev * 100),
      ses_margin:  ((ses_rev  - s.ses.cost)  / ses_rev  * 100),
      wht_margin:  ((wht_rev  - s.wheat.cost) / wht_rev  * 100),
      simple_roi, payback_yrs, land_val_10, total_farm_income_10, total_return_10, irr_approx
    };
  }, [currentParams]);

  // Chart Data
  const years = Array.from({length:10}, (_, i) => (2025 + i).toString());
  const buildIncome = (sc: Scenario) => {
    const base_net = (sc.rice.yield * sc.rice.price + sc.ses.yield * sc.ses.price + sc.wheat.yield * sc.wheat.price) - (sc.rice.cost + sc.ses.cost + sc.wheat.cost);
    return years.map((_,i) => Math.round(base_net * Math.pow(1 + (sc.land_app/100 - sc.inflation/100)/2, i)));
  };

  const lineChartData = {
    labels: years,
    datasets: [
      {
        label: 'Optimistic',
        data: buildIncome(defaultScenarios.optimistic),
        borderColor: '#1D9E75',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: activeScenario === 'custom' ? 'Custom' : activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1),
        data: buildIncome(currentParams),
        borderColor: '#378ADD',
        backgroundColor: 'rgba(55,138,221,0.1)',
        fill: true,
        borderWidth: 3,
        tension: 0.3,
      },
      {
        label: 'Pessimistic',
        data: buildIncome(defaultScenarios.pessimistic),
        borderColor: '#E24B4A',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3,
      }
    ]
  };

  const waterfallData = {
    labels: ['Rice Rev','Sesame Rev','Wheat Rev','Rice Cost','Sesame Cost','Wheat Cost','Net Income'],
    datasets: [{
      label: 'Cash Flow',
      data: [calc.rice_rev, calc.ses_rev, calc.wht_rev, -currentParams.rice.cost, -currentParams.ses.cost, -currentParams.wheat.cost, calc.net],
      backgroundColor: [
        '#1D9E75', '#EF9F27', '#378ADD', // Revenues
        '#dc3545', '#dc3545', '#dc3545', // Costs
        calc.net >= 0 ? '#1D9E75' : '#dc3545' // Net
      ],
      borderRadius: 4,
    }]
  };

  return (
    <div className="dashboard-wrapper">
      <div className="mb-5 border-bottom pb-4">
        <h2 className="h3 fw-bold mb-2">Farm ROI Model — Qadirpur Rawan, Multan</h2>
        <p className="text-muted mb-0" style={{ fontSize: '15px' }}>1 acre · Land cost: PKR 9,000,000 · 3 crops/year (Rice → Sesame → Wheat)</p>
      </div>

      <div className="mb-4">
        <h6 className="text-uppercase text-muted fw-bold mb-3" style={{ fontSize: '12px', letterSpacing: '0.05em' }}>Scenario Selector</h6>
        <div className="d-flex flex-wrap gap-2">
          {['base', 'optimistic', 'pessimistic', 'custom'].map(scenario => (
            <button
              key={scenario}
              onClick={() => setActiveScenario(scenario as any)}
              className={`btn ${activeScenario === scenario ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
            >
              {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeScenario === 'custom' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="card card-custom mb-4 overflow-hidden"
          >
            <div className="card-body bg-light">
              <h6 className="fw-bold mb-3"><Target className="me-2" size={18}/> Adjust Assumptions</h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Rice Yield (maund) <strong>{customParams.rice.yield}</strong>
                  </label>
                  <input type="range" className="form-range" min="20" max="55" value={customParams.rice.yield} onChange={e => updateCustom('rice', 'yield', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Rice Price (PKR) <strong>{customParams.rice.price}</strong>
                  </label>
                  <input type="range" className="form-range" min="2500" max="6500" step="100" value={customParams.rice.price} onChange={e => updateCustom('rice', 'price', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Sesame Yield (kg) <strong>{customParams.ses.yield}</strong>
                  </label>
                  <input type="range" className="form-range" min="150" max="550" step="10" value={customParams.ses.yield} onChange={e => updateCustom('ses', 'yield', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Sesame Price (PKR) <strong>{customParams.ses.price}</strong>
                  </label>
                  <input type="range" className="form-range" min="700" max="1800" step="50" value={customParams.ses.price} onChange={e => updateCustom('ses', 'price', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Wheat Yield (maund) <strong>{customParams.wheat.yield}</strong>
                  </label>
                  <input type="range" className="form-range" min="18" max="50" value={customParams.wheat.yield} onChange={e => updateCustom('wheat', 'yield', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Wheat Price (PKR) <strong>{customParams.wheat.price}</strong>
                  </label>
                  <input type="range" className="form-range" min="2000" max="5000" step="100" value={customParams.wheat.price} onChange={e => updateCustom('wheat', 'price', +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Inflation (%) <strong>{customParams.inflation}%</strong>
                  </label>
                  <input type="range" className="form-range" min="0" max="25" value={customParams.inflation} onChange={e => updateCustom('inflation', null, +e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small d-flex justify-content-between">
                    Land Apprec. (%) <strong>{customParams.land_app}%</strong>
                  </label>
                  <input type="range" className="form-range" min="0" max="20" value={customParams.land_app} onChange={e => updateCustom('land_app', null, +e.target.value)} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 mt-5 border-bottom">
        <ul className="nav nav-tabs border-0 mobile-tabs flex-nowrap" style={{ gap: '15px' }}>
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = viewTab === tab.id;
            return (
            <li className="nav-item" key={tab.id} style={{ whiteSpace: 'nowrap' }}>
              <button
                className={`nav-link border-0 d-flex align-items-center ${isActive ? 'active text-success fw-bold border-bottom border-success border-3' : 'text-muted'}`}
                style={{ backgroundColor: 'transparent', borderBottom: isActive ? '3px solid #1D9E75 !important' : 'none', borderRadius: 0, paddingBottom: '12px' }}
                onClick={() => setViewTab(tab.id)}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.2 : 1, rotate: isActive ? [0, -10, 10, 0] : 0 }}
                  transition={{ duration: 0.4 }}
                  className={`me-2 ${isActive ? 'text-success' : 'text-muted'}`}
                >
                  <Icon size={18} />
                </motion.div>
                {tab.id}
              </button>
            </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pt-3"
        >
          {viewTab === 'Annual Summary' && (
            <div>
              <div className="row g-3 mb-5">
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Gross revenue</p>
                    <h4 className="mb-0 fw-bold">{fmtPKR(calc.total_rev)}</h4>
                  </div>
                </div>
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Total costs</p>
                    <h4 className="mb-0 fw-bold">{fmtPKR(calc.total_cost)}</h4>
                  </div>
                </div>
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Net income</p>
                    <h4 className={`mb-0 fw-bold ${calc.net >= 0 ? 'kpi-pos' : 'kpi-neg'}`}>{fmtPKR(calc.net)}</h4>
                  </div>
                </div>
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Cash ROI</p>
                    <h4 className={`mb-0 fw-bold ${calc.simple_roi >= 5 ? 'kpi-pos' : 'kpi-warn'}`}>{calc.simple_roi.toFixed(1)}%</h4>
                  </div>
                </div>
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Payback</p>
                    <h4 className={`mb-0 fw-bold ${calc.payback_yrs <= 20 ? 'kpi-pos' : 'kpi-warn'}`}>{calc.payback_yrs > 99 ? '∞' : calc.payback_yrs.toFixed(1) + ' yrs'}</h4>
                  </div>
                </div>
                <div className="col-md-4 col-lg-2">
                  <div className="card card-custom h-100 p-4">
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Est. IRR (10y)</p>
                    <h4 className={`mb-0 fw-bold ${calc.irr_approx >= 8 ? 'kpi-pos' : 'kpi-warn'}`}>{calc.irr_approx.toFixed(1)}%</h4>
                  </div>
                </div>
              </div>

              <div className="row g-4 mb-5">
                <div className="col-lg-7">
                  <div className="card card-custom h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-4">Annual Net Income (10-Year Projection)</h5>
                      <div style={{ height: '300px' }}>
                        <Line 
                          data={lineChartData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } },
                            scales: { y: { beginAtZero: true } }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="card card-custom h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-4">Cash Flow Waterfall (Year 1)</h5>
                      <div style={{ height: '300px' }}>
                        <Bar 
                          data={waterfallData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewTab === 'Per-crop Breakdown' && (
            <div className="row g-3 mb-5">
              {[
                { name: 'Rice', color: '#1D9E75', rev: calc.rice_rev, cost: currentParams.rice.cost, net: calc.rice_rev - currentParams.rice.cost, margin: calc.rice_margin, yield: currentParams.rice.yield + ' maund', price: currentParams.rice.price },
                { name: 'Sesame', color: '#EF9F27', rev: calc.ses_rev, cost: currentParams.ses.cost, net: calc.ses_rev - currentParams.ses.cost, margin: calc.ses_margin, yield: currentParams.ses.yield + ' kg', price: currentParams.ses.price },
                { name: 'Wheat', color: '#378ADD', rev: calc.wht_rev, cost: currentParams.wheat.cost, net: calc.wht_rev - currentParams.wheat.cost, margin: calc.wht_margin, yield: currentParams.wheat.yield + ' maund', price: currentParams.wheat.price }
              ].map(cr => (
                <div className="col-md-4" key={cr.name}>
                  <div className="card card-custom h-100">
                    <div className="card-body">
                      <h5 className="d-flex align-items-center mb-4">
                        <span className="me-2 rounded-circle" style={{width: 12, height: 12, background: cr.color}}></span>
                        {cr.name}
                      </h5>
                      <div className="d-flex justify-content-between border-bottom py-2 small"><span className="text-muted">Yield</span><span className="fw-bold">{cr.yield}</span></div>
                      <div className="d-flex justify-content-between border-bottom py-2 small"><span className="text-muted">Price</span><span className="fw-bold">PKR {cr.price.toLocaleString()}</span></div>
                      <div className="d-flex justify-content-between border-bottom py-2 small"><span className="text-muted">Revenue</span><span className="fw-bold">PKR {Math.round(cr.rev).toLocaleString()}</span></div>
                      <div className="d-flex justify-content-between border-bottom py-2 small"><span className="text-muted">Cost</span><span className="fw-bold">PKR {Math.round(cr.cost).toLocaleString()}</span></div>
                      <div className="d-flex justify-content-between border-bottom py-2 small"><span className="text-muted">Net</span><span className={`fw-bold ${cr.net >= 0 ? 'text-success' : 'text-danger'}`}>PKR {Math.round(cr.net).toLocaleString()}</span></div>
                      <div className="d-flex justify-content-between py-2 small"><span className="text-muted">Margin</span><span className={`fw-bold ${cr.margin >= 30 ? 'text-success' : cr.margin >= 10 ? 'text-warning' : 'text-danger'}`}>{cr.margin.toFixed(1)}%</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewTab === 'Investment Analysis' && (
            <div className="row g-3">
              {[
                { label: 'Land investment', val: 'PKR 9,000,000', cls: '' },
                { label: 'Annual farm income', val: fmtPKR(calc.net), cls: calc.net >= 0 ? 'kpi-pos' : 'kpi-neg' },
                { label: 'Land value (10yr)', val: fmtPKR(calc.land_val_10), cls: 'kpi-pos' },
                { label: 'Total 10yr return', val: fmtPKR(calc.total_return_10), cls: calc.total_return_10 >= 0 ? 'kpi-pos' : 'kpi-neg' },
                { label: 'Cash ROI (annual)', val: calc.simple_roi.toFixed(1) + '%', cls: calc.simple_roi >= 5 ? 'kpi-pos' : 'kpi-warn' },
                { label: 'Estimated IRR (10yr)', val: calc.irr_approx.toFixed(1) + '%', cls: calc.irr_approx >= 8 ? 'kpi-pos' : 'kpi-warn' },
              ].map((i, idx) => (
                <div className="col-md-4 col-lg-4" key={idx}>
                  <div className="card card-custom h-100 p-4 bg-light border-0">
                    <p className="text-muted small mb-2">{i.label}</p>
                    <h4 className={`mb-0 fw-bold ${i.cls}`}>{i.val}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="alert alert-secondary mt-5 small d-flex align-items-center">
        <Info className="me-3 flex-shrink-0" size={24} />
        <div>
          <strong>Assumptions:</strong> 1 acre Qadirpur Rawan, Multan. Rice (Kharif, Jun–Oct), Sesame (Kharif/Rabi bridge, Jul–Oct), Wheat (Rabi, Nov–Apr). Land investment: PKR 9,000,000. Cost estimates include seeds, fertilizer, pesticides, irrigation, labour, and harvesting. ROI excludes land appreciation; Total return includes it.
        </div>
      </div>
    </div>
  );
}
