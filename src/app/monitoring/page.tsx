"use client"
import { useEffect, useState } from 'react';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdSunny, IoMdMoon } from 'react-icons/io';
import { HiChartBar, HiChartPie } from 'react-icons/hi';
import { FiActivity, FiCpu, FiThermometer, FiServer, FiHardDrive } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';

const generateMetric = (base: number, variance: number) =>
  Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance));

const getStatusConfig = (val: number) => {
  if (val > 80) return {
    bgColor: 'bg-gradient-to-br from-red-500/20 to-red-600/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    iconColor: 'text-red-500',
    icon: <FiActivity className="inline-block w-5 h-5 mr-1.5" />
  };
  if (val > 60) return {
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-amber-600/20',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-400',
    iconColor: 'text-amber-500',
    icon: <FiActivity className="inline-block w-5 h-5 mr-1.5" />
  };
  return {
    bgColor: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    iconColor: 'text-emerald-500',
    icon: <FiActivity className="inline-block w-5 h-5 mr-1.5" />
  };
};

const getMetricIcon = (key: string) => {
  switch (key) {
    case 'temperature': return <FiThermometer className="w-5 h-5" />;
    case 'cpu': return <FiCpu className="w-5 h-5" />;
    case 'memory': return <FiHardDrive className="w-5 h-5" />;
    case 'traffic': return <FiServer className="w-5 h-5" />;
    default: return <FiActivity className="w-5 h-5" />;
  }
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    temperature: 30,
    cpu: 40,
    memory: 50,
    traffic: 20,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'traffic'>('cpu');

  useEffect(() => {
    const localTheme = localStorage.getItem('theme');
    const chartPref = localStorage.getItem('chartType');
    if (localTheme) setDarkMode(localTheme === 'dark');
    if (chartPref) setChartType(chartPref as 'line' | 'bar' | 'area');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('chartType', chartType);
  }, [darkMode, chartType]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = {
        temperature: generateMetric(30, 10),
        cpu: generateMetric(40, 30),
        memory: generateMetric(50, 25),
        traffic: generateMetric(20, 15),
      };
      setMetrics(next);
      setHistory(prev => [...prev.slice(-29), { ...next, time: new Date().toLocaleTimeString() }]);

      const newAlerts: string[] = [];
      if (next.cpu > 60) newAlerts.push(`High CPU usage: ${next.cpu.toFixed(1)}%`);
      if (next.memory > 60) newAlerts.push(`High Memory load: ${next.memory.toFixed(1)}%`);
      if (next.temperature > 50) newAlerts.push(`Temperature spike: ${next.temperature.toFixed(1)}°C`);
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getChartComponent = () => {
    switch (chartType) {
      case 'line': return LineChart;
      case 'bar': return BarChart;
      case 'area': return AreaChart;
      default: return LineChart;
    }
  };

  const getChartElement = () => {
    switch (chartType) {
      case 'line':
        return <Line
          type="monotone"
          dataKey={selectedMetric}
          stroke={darkMode ? "#10b981" : "#059669"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />;
      case 'bar':
        return <Bar
          dataKey={selectedMetric}
          fill={darkMode ? "#10b981" : "#059669"}
          radius={[4, 4, 0, 0]}
        />;
      case 'area':
        return <Area
          type="monotone"
          dataKey={selectedMetric}
          stroke={darkMode ? "#10b981" : "#059669"}
          fillOpacity={0.2}
          fill={darkMode ? "#10b981" : "#059669"}
          dot={false}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />;
      default:
        return <Line
          type="monotone"
          dataKey={selectedMetric}
          stroke={darkMode ? "#10b981" : "#059669"}
          strokeWidth={2}
          dot={false}
        />;
    }
  };

  const ChartComponent = getChartComponent();
  const ChartElement = getChartElement();

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'} transition-colors duration-500 min-h-screen font-sans`}>
      <nav className={`px-6 py-4 flex justify-between items-center ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/60 border-slate-200'} backdrop-blur-lg sticky top-0 z-10 border-b`}>
        <h1 className="text-2xl font-bold flex items-center">
          <span className={`mr-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <FiActivity className="inline-block w-6 h-6" />
          </span>
          <span className="font-light">Pulse</span><span className="font-semibold">Monitor</span>
        </h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(prev => !prev)}
            className={`p-2 rounded-full ${darkMode ? 'bg-slate-700 text-amber-400 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} transition-colors duration-200`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <IoMdSunny className="w-5 h-5" /> : <IoMdMoon className="w-5 h-5" />}
          </motion.button>
          <div className={`p-1 rounded-full flex ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-full transition-colors duration-200 ${chartType === 'line' ? (darkMode ? 'bg-slate-600 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : ''}`}
              aria-label="Line chart"
            >
              <FiActivity className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-full transition-colors duration-200 ${chartType === 'area' ? (darkMode ? 'bg-slate-600 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : ''}`}
              aria-label="Area chart"
            >
              <HiChartPie className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-full transition-colors duration-200 ${chartType === 'bar' ? (darkMode ? 'bg-slate-600 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : ''}`}
              aria-label="Bar chart"
            >
              <HiChartBar className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, val]) => {
            const status = getStatusConfig(val);
            return (
              <motion.div
                key={key}
                layout
                className={`rounded-xl p-5 ${status.bgColor} ${status.borderColor} border shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                  selectedMetric === key ? (darkMode ? 'ring-2 ring-emerald-500/50' : 'ring-2 ring-emerald-500/30') : ''
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ translateY: -4 }}
                onClick={() => setSelectedMetric(key as 'cpu' | 'memory' | 'traffic')}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className={`text-sm font-medium uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{key}</h2>
                  <span className={`${status.iconColor}`}>
                    {getMetricIcon(key)}
                  </span>
                </div>
                <p className={`text-3xl font-bold ${status.textColor}`}>
                  {key === 'temperature' ? `${val.toFixed(1)}°C` : `${val.toFixed(1)}%`}
                </p>
                <div className="mt-3 flex items-center">
                  <div className={`w-full h-1.5 bg-slate-700/20 rounded-full overflow-hidden ${selectedMetric === key ? 'animate-pulse' : ''}`}>
                    <div
                      className={`h-full rounded-full ${val > 80 ? 'bg-red-500' : val > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
                <p className={`mt-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedMetric === key ?
                    <span className="flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-emerald-400' : 'bg-emerald-600'} mr-1.5 animate-pulse`}></span>
                      Currently monitoring
                    </span> :
                    'Click to view details'
                  }
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          layout
          className={`rounded-xl ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'} border shadow-lg overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-slate-700/30 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center">
              <span className={`mr-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {getMetricIcon(selectedMetric)}
              </span>
              <span className="capitalize">{selectedMetric}</span> Trend
            </h2>
            <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              Last 30 updates
            </div>
          </div>
          <div className="px-4 py-4">
            <ResponsiveContainer width="100%" height={300}>
              <ChartComponent data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: darkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)' }}
                  stroke={darkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(71, 85, 105, 0.8)'}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  stroke={darkMode ? 'rgba(148, 163, 184, 0.5)' : 'rgba(71, 85, 105, 0.8)'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: darkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.8)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: darkMode ? '#e2e8f0' : '#334155'
                  }}
                  itemStyle={{ color: darkMode ? '#10b981' : '#059669' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
                  cursor={{ stroke: darkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.5)', strokeWidth: 1 }}
                />
                {ChartElement}
              </ChartComponent>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          layout
          className={`rounded-xl ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'} border shadow-lg overflow-hidden`}
        >
          <div className="px-6 py-4 border-b border-slate-700/30 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center">
              <span className={`mr-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                <FiActivity className="inline-block w-5 h-5" />
              </span>
              Recent Alerts
            </h2>
            <div className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
            </div>
          </div>
          {alerts.length > 0 ? (
            <ul className="divide-y divide-slate-700/20 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {alerts.map((alert, i) => (
                  <motion.li
                    key={alert + i}
                    className={`${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/50' : 'bg-white hover:bg-slate-50'} transition-colors duration-150`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 py-4 flex justify-between items-center">
                      <div className="flex items-start">
                        <span className={`mt-0.5 mr-3 flex-shrink-0 w-2 h-2 rounded-full ${alert.includes('CPU') ? 'bg-red-500' : alert.includes('Memory') ? 'bg-amber-500' : 'bg-purple-500'} animate-pulse`}></span>
                        <span>{alert}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAlerts(prev => prev.filter((_, idx) => idx !== i))}
                        className={`ml-4 p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'} transition-colors duration-150`}
                        aria-label="Dismiss alert"
                      >
                        <MdClose className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <div className={`px-6 py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <p>No active alerts at the moment</p>
            </div>
          )}
        </motion.div>
      </main>

      <footer className={`py-6 text-center text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'} mt-10 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <p>
            <span className={`inline-block ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <FiActivity className="inline-block w-3 h-3 mr-1" />
            </span>
            PulseMonitor v1.0 — {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
