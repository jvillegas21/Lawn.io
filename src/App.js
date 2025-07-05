import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Calendar, Sprout, MapPin, Ruler } from 'lucide-react';
import SettingsScreen from './components/SettingsScreen';
import ApplicationScreen from './components/ApplicationScreen';
import SoilReportUpload from './components/SoilReportUpload';

function App() {
  const [activeTab, setActiveTab] = useState('application');
  const [settings, setSettings] = useState({
    grassType: '',
    zipCode: '',
    squareFootage: '',
    useGeolocation: false
  });
  const [soilData, setSoilData] = useState(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('lawnPgrSettings');
    const savedSoilData = localStorage.getItem('lawnSoilData');
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    
    if (savedSoilData) {
      try {
        setSoilData(JSON.parse(savedSoilData));
      } catch (error) {
        console.error('Error parsing saved soil data:', error);
      }
    }
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('lawnPgrSettings', JSON.stringify(newSettings));
  };

  const saveSoilData = (newSoilData) => {
    setSoilData(newSoilData);
    localStorage.setItem('lawnSoilData', JSON.stringify(newSoilData));
  };

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{ 
          textAlign: 'center', 
          color: '#0f172a', 
          marginBottom: '32px',
          fontSize: '2.5rem',
          fontWeight: '700',
          letterSpacing: '-0.025em'
        }}>
          🌱 Lawn Tracker
        </h1>

        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'application' ? 'active' : ''}`}
            onClick={() => setActiveTab('application')}
            aria-label="Applications tab"
          >
            <Calendar size={18} />
            Applications
          </button>
          <button
            className={`nav-tab ${activeTab === 'soil' ? 'active' : ''}`}
            onClick={() => setActiveTab('soil')}
            aria-label="Soil Report tab"
          >
            <Sprout size={18} />
            Soil Report
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="Settings tab"
          >
            <Settings size={18} />
            Settings
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'application' && (
            <motion.div
              key="application"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ApplicationScreen settings={settings} soilData={soilData} />
            </motion.div>
          )}
          
          {activeTab === 'soil' && (
            <motion.div
              key="soil"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SoilReportUpload onSoilDataUpdate={setSoilData} settings={settings} />
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SettingsScreen settings={settings} onSave={saveSettings} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App; 