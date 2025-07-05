import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, RefreshCw, Droplets, Calculator, Edit, Save, X, AlertCircle, Leaf, Zap } from 'lucide-react';
import { 
  calculateGDD, 
  getGrassTypeBaseTemp, 
  estimateNextApplication, 
  getCurrentWeather,
  getWeatherIconUrl 
} from '../utils/gddCalculator';
import { 
  calculateNextFertilizerApplication, 
  calculateNextIronApplication,
  FERTILIZER_TYPES,
  IRON_PRODUCTS 
} from '../utils/fertilizerCalculator';

const ApplicationScreen = ({ settings, soilData }) => {
  const [applications, setApplications] = useState([]);
  const [fertilizerApplications, setFertilizerApplications] = useState([]);
  const [ironApplications, setIronApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [applicationType, setApplicationType] = useState('pgr'); // pgr, fertilizer, iron
  const [activeTab, setActiveTab] = useState('pgr');
  const [editingId, setEditingId] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ouncesPer1000: '',
    notes: '',
    productType: '',
    npk: ''
  });

  useEffect(() => {
    // Load all application types from localStorage
    const savedApplications = localStorage.getItem('lawnPgrApplications');
    const savedFertilizer = localStorage.getItem('lawnFertilizerApplications');
    const savedIron = localStorage.getItem('lawnIronApplications');
    
    if (savedApplications) {
      try {
        setApplications(JSON.parse(savedApplications));
      } catch (error) {
        console.error('Error parsing saved applications:', error);
        setApplications([]);
      }
    }
    
    if (savedFertilizer) {
      try {
        setFertilizerApplications(JSON.parse(savedFertilizer));
      } catch (error) {
        console.error('Error parsing saved fertilizer applications:', error);
        setFertilizerApplications([]);
      }
    }
    
    if (savedIron) {
      try {
        setIronApplications(JSON.parse(savedIron));
      } catch (error) {
        console.error('Error parsing saved iron applications:', error);
        setIronApplications([]);
      }
    }
  }, []);

  useEffect(() => {
    if (settings.zipCode) {
      fetchWeatherData();
    }
  }, [settings.zipCode]);

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    
    try {
      const data = await getCurrentWeather(settings.zipCode);
      setWeatherData(data);
    } catch (error) {
      setWeatherError(error.message);
      console.error('Weather fetch error:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const saveApplications = (newApplications) => {
    setApplications(newApplications);
    localStorage.setItem('lawnPgrApplications', JSON.stringify(newApplications));
  };

  const saveFertilizerApplications = (newApplications) => {
    setFertilizerApplications(newApplications);
    localStorage.setItem('lawnFertilizerApplications', JSON.stringify(newApplications));
  };

  const saveIronApplications = (newApplications) => {
    setIronApplications(newApplications);
    localStorage.setItem('lawnIronApplications', JSON.stringify(newApplications));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      ouncesPer1000: '',
      notes: '',
      productType: '',
      npk: ''
    });
    setEditingId(null);
    setShowForm(false);
    setApplicationType('pgr');
  };

  const startEdit = (application, type) => {
    setApplicationType(type);
    setFormData({
      date: application.date,
      ouncesPer1000: application.ouncesPer1000?.toString() || application.rate?.toString() || '',
      notes: application.notes || '',
      productType: application.productType || '',
      npk: application.npk || ''
    });
    setEditingId(application.id);
    setShowForm(true);
  };

  const saveApplication = () => {
    if (!formData.ouncesPer1000) return;

    const applicationData = {
      date: formData.date,
      notes: formData.notes,
      timestamp: new Date().toISOString()
    };

    if (applicationType === 'pgr') {
      applicationData.ouncesPer1000 = parseFloat(formData.ouncesPer1000);
    } else if (applicationType === 'fertilizer') {
      applicationData.rate = parseFloat(formData.ouncesPer1000);
      applicationData.productType = formData.productType;
      applicationData.npk = formData.npk;
    } else if (applicationType === 'iron') {
      applicationData.rate = parseFloat(formData.ouncesPer1000);
      applicationData.productType = formData.productType;
    }

    if (editingId) {
      // Update existing application
      if (applicationType === 'pgr') {
        const updatedApplications = applications.map(app => 
          app.id === editingId ? { ...app, ...applicationData } : app
        );
        saveApplications(updatedApplications);
      } else if (applicationType === 'fertilizer') {
        const updatedApplications = fertilizerApplications.map(app => 
          app.id === editingId ? { ...app, ...applicationData } : app
        );
        saveFertilizerApplications(updatedApplications);
      } else if (applicationType === 'iron') {
        const updatedApplications = ironApplications.map(app => 
          app.id === editingId ? { ...app, ...applicationData } : app
        );
        saveIronApplications(updatedApplications);
      }
    } else {
      // Add new application
      const newApplication = {
        id: Date.now(),
        ...applicationData
      };

      if (applicationType === 'pgr') {
        const updatedApplications = [newApplication, ...applications];
        saveApplications(updatedApplications);
      } else if (applicationType === 'fertilizer') {
        const updatedApplications = [newApplication, ...fertilizerApplications];
        saveFertilizerApplications(updatedApplications);
      } else if (applicationType === 'iron') {
        const updatedApplications = [newApplication, ...ironApplications];
        saveIronApplications(updatedApplications);
      }
    }
    
    resetForm();
  };

  const deleteApplication = (id, type) => {
    if (type === 'pgr') {
      const updatedApplications = applications.filter(app => app.id !== id);
      saveApplications(updatedApplications);
    } else if (type === 'fertilizer') {
      const updatedApplications = fertilizerApplications.filter(app => app.id !== id);
      saveFertilizerApplications(updatedApplications);
    } else if (type === 'iron') {
      const updatedApplications = ironApplications.filter(app => app.id !== id);
      saveIronApplications(updatedApplications);
    }
  };

  const getTotalOunces = () => {
    if (!settings.squareFootage) return 0;
    return applications.reduce((total, app) => {
      return total + (app.ouncesPer1000 * settings.squareFootage / 1000);
    }, 0);
  };

  const getLastApplication = () => {
    return applications.length > 0 ? applications[0] : null;
  };

  const getDaysSinceLastApplication = () => {
    const lastApp = getLastApplication();
    if (!lastApp) return null;
    
    const lastDate = new Date(lastApp.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGDDInfo = () => {
    if (!weatherData || !settings.grassType) return null;
    
    const baseTemp = getGrassTypeBaseTemp(settings.grassType);
    const currentGDD = calculateGDD(
      weatherData.forecast.avgMaxTemp, 
      weatherData.forecast.avgMinTemp, 
      baseTemp
    );
    const lastApp = getLastApplication();
    
    if (!lastApp) return { currentGDD, baseTemp, weatherData };
    
    const nextAppEstimate = estimateNextApplication(lastApp.date, currentGDD);
    
    return {
      currentGDD,
      baseTemp,
      nextAppEstimate,
      weatherData
    };
  };

  const gddInfo = getGDDInfo();

  const getLastFertilizerApplication = () => {
    return fertilizerApplications.length > 0 ? fertilizerApplications[0] : null;
  };

  const getLastIronApplication = () => {
    return ironApplications.length > 0 ? ironApplications[0] : null;
  };

  const getFertilizerRecommendations = () => {
    const lastApp = getLastFertilizerApplication();
    if (!lastApp || !lastApp.productType) return null;
    
    return calculateNextFertilizerApplication(lastApp, lastApp.productType, settings.grassType, soilData);
  };

  const getIronRecommendations = () => {
    const lastApp = getLastIronApplication();
    if (!lastApp || !lastApp.productType) return null;
    
    return calculateNextIronApplication(lastApp, lastApp.productType, settings.grassType, soilData);
  };

  const fertilizerRecs = getFertilizerRecommendations();
  const ironRecs = getIronRecommendations();

  return (
    <div>
      {/* Weather Status */}
      {weatherError && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
          borderLeft: '4px solid #f44336',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="#f44336" />
            <div>
              <strong>Weather Data Error:</strong> {weatherError}
              <button 
                onClick={fetchWeatherData}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f44336',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="stat-value">
            {applications.length + fertilizerApplications.length + ironApplications.length}
          </div>
          <div className="stat-label">Total Applications</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="stat-value">
            {applications.length}
          </div>
          <div className="stat-label">PGR Applications</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stat-value">
            {fertilizerApplications.length}
          </div>
          <div className="stat-label">Fertilizer Applications</div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="stat-value">
            {ironApplications.length}
          </div>
          <div className="stat-label">Iron Applications</div>
        </motion.div>
      </div>

      {/* Application Type Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <motion.button
          className="btn"
          onClick={() => {
            setApplicationType('pgr');
            setShowForm(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Droplets size={20} />
          Add PGR Application
        </motion.button>
        
        <motion.button
          className="btn"
          onClick={() => {
            setApplicationType('fertilizer');
            setShowForm(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Leaf size={20} />
          Add Fertilizer
        </motion.button>
        
        <motion.button
          className="btn"
          onClick={() => {
            setApplicationType('iron');
            setShowForm(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap size={20} />
          Add Iron
        </motion.button>
      </div>

      {/* Add/Edit Application Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#495057', margin: 0 }}>
                {applicationType === 'pgr' && <Droplets size={20} style={{ marginRight: '8px' }} />}
                {applicationType === 'fertilizer' && <Leaf size={20} style={{ marginRight: '8px' }} />}
                {applicationType === 'iron' && <Zap size={20} style={{ marginRight: '8px' }} />}
                {editingId ? `Edit ${applicationType.toUpperCase()} Application` : `New ${applicationType.toUpperCase()} Application`}
              </h3>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="date">Application Date</label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="input-group">
              <label htmlFor="rate">
                {applicationType === 'pgr' ? 'Ounces per 1,000 sq ft' : 
                 applicationType === 'fertilizer' ? 'Pounds per 1,000 sq ft' : 
                 'Ounces per 1,000 sq ft'}
              </label>
              <input
                id="rate"
                type="number"
                step="0.1"
                placeholder={applicationType === 'pgr' ? 'Enter ounces per 1,000 sq ft' : 
                           applicationType === 'fertilizer' ? 'Enter pounds per 1,000 sq ft' : 
                           'Enter ounces per 1,000 sq ft'}
                value={formData.ouncesPer1000}
                onChange={(e) => setFormData(prev => ({ ...prev, ouncesPer1000: e.target.value }))}
              />
            </div>

            {applicationType === 'fertilizer' && (
              <>
                <div className="input-group">
                  <label htmlFor="productType">Fertilizer Product</label>
                  <select
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                  >
                    <option value="">Select fertilizer product</option>
                    {Object.keys(FERTILIZER_TYPES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="npk">NPK Ratio (optional)</label>
                  <input
                    id="npk"
                    type="text"
                    placeholder="e.g., 32-0-4"
                    value={formData.npk}
                    onChange={(e) => setFormData(prev => ({ ...prev, npk: e.target.value }))}
                  />
                </div>
              </>
            )}

            {applicationType === 'iron' && (
              <div className="input-group">
                <label htmlFor="productType">Iron Product</label>
                <select
                  id="productType"
                  value={formData.productType}
                  onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                >
                  <option value="">Select iron product</option>
                  {Object.keys(IRON_PRODUCTS).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                type="text"
                placeholder="Any notes about this application"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn"
                onClick={saveApplication}
                disabled={!formData.ouncesPer1000}
              >
                {editingId ? <Save size={16} /> : <Calculator size={16} />}
                <span style={{ marginLeft: '8px' }}>
                  {editingId ? 'Update Application' : 'Add Application'}
                </span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-by-side Recommendations and Weather (responsive) */}
      <div style={{
        display: (fertilizerRecs || ironRecs) ? 'flex' : 'block',
        gap: '24px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'stretch',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {(fertilizerRecs || ironRecs) && (
          <div className="card" style={{
            background: '#dcfce7',
            border: 'none',
            minWidth: 320,
            maxWidth: 420,
            flex: '1 1 320px'
          }}>
            <h3 style={{ color: '#166534', marginBottom: '16px' }}>
              🌱 Application Recommendations
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {fertilizerRecs && (
                <div style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#166534', marginBottom: '8px' }}>
                    <Leaf size={16} style={{ marginRight: '8px' }} />
                    Fertilizer
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                    {fertilizerRecs.message}
                  </div>
                  {fertilizerRecs.recommendations && fertilizerRecs.recommendations.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#475569' }}>
                      <strong>Tips:</strong> {fertilizerRecs.recommendations.join(', ')}
                    </div>
                  )}
                </div>
              )}
              {ironRecs && (
                <div style={{
                  background: '#f0fdf4',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#166534', marginBottom: '8px' }}>
                    <Zap size={16} style={{ marginRight: '8px' }} />
                    Iron
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                    {ironRecs.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {weatherData && (
          <div className="card" style={{
            background: '#dbeafe',
            border: 'none',
            flex: '2 1 400px',
            minWidth: 320,
            maxWidth: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ color: '#0369a1', margin: 0 }}>
                ️ Current Weather & GDD Information
              </h3>
              <button
                onClick={fetchWeatherData}
                disabled={weatherLoading}
                className="refresh-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  opacity: weatherLoading ? 0.5 : 1
                }}
                title="Update Weather"
                aria-label="Update Weather"
              >
                <RefreshCw size={16} color="#0369a1" aria-hidden="true" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>Location:</strong> {weatherData.location.city}, {weatherData.location.zipCode}
              </div>
              <div>
                <strong>Current Temp:</strong> {weatherData.current.temp.toFixed(1)}°F
              </div>
              <div>
                <strong>Forecast Avg:</strong> {weatherData.forecast.avgMaxTemp.toFixed(1)}°F / {weatherData.forecast.avgMinTemp.toFixed(1)}°F
              </div>
              <div>
                <strong>Humidity:</strong> {weatherData.current.humidity}%
              </div>
              <div>
                <strong>Conditions:</strong> {weatherData.current.description}
              </div>
              {gddInfo && (
                <div>
                  <strong>Current GDD:</strong> {gddInfo.currentGDD.toFixed(1)}
                </div>
              )}
              {gddInfo && (
                <div>
                  <strong>Base Temp:</strong> {gddInfo.baseTemp}°F ({settings.grassType || 'Not set'})
                </div>
              )}
            </div>
            {gddInfo && gddInfo.nextAppEstimate && (
              <div style={{
                background: '#f0f9ff',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Next Application Estimate:</strong> {gddInfo.nextAppEstimate.message}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                  <strong>GDD Rate:</strong> {gddInfo.nextAppEstimate.gddPerDay} GDD/day | 
                  <strong> Recommended Interval:</strong> {gddInfo.nextAppEstimate.recommendedInterval} days
                </div>
              </div>
            )}
            <div style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>
              <strong>Note:</strong> GDD calculations are estimates based on current weather conditions. 
              PGR applications typically occur every 2-4 weeks depending on growth rate. 
              Always follow product label recommendations for application timing. Weather data provided by OpenWeatherMap.
            </div>
          </div>
        )}
      </div>

      {/* Application History Tabs */}
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            className={`nav-tab ${activeTab === 'pgr' ? 'active' : ''}`}
            onClick={() => setActiveTab('pgr')}
          >
            <Droplets size={16} style={{ marginRight: '8px' }} />
            PGR ({applications.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'fertilizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('fertilizer')}
          >
            <Leaf size={16} style={{ marginRight: '8px' }} />
            Fertilizer ({fertilizerApplications.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'iron' ? 'active' : ''}`}
            onClick={() => setActiveTab('iron')}
          >
            <Zap size={16} style={{ marginRight: '8px' }} />
            Iron ({ironApplications.length})
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pgr' && (
            <ApplicationHistory 
              applications={applications}
              type="pgr"
              onEdit={(app) => startEdit(app, 'pgr')}
              onDelete={(id) => deleteApplication(id, 'pgr')}
              settings={settings}
            />
          )}
          
          {activeTab === 'fertilizer' && (
            <ApplicationHistory 
              applications={fertilizerApplications}
              type="fertilizer"
              onEdit={(app) => startEdit(app, 'fertilizer')}
              onDelete={(id) => deleteApplication(id, 'fertilizer')}
              settings={settings}
            />
          )}
          
          {activeTab === 'iron' && (
            <ApplicationHistory 
              applications={ironApplications}
              type="iron"
              onEdit={(app) => startEdit(app, 'iron')}
              onDelete={(id) => deleteApplication(id, 'iron')}
              settings={settings}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Application History Component
const ApplicationHistory = ({ applications, type, onEdit, onDelete, settings }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'pgr': return <Droplets size={20} />;
      case 'fertilizer': return <Leaf size={20} />;
      case 'iron': return <Zap size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'pgr': return 'PGR';
      case 'fertilizer': return 'Fertilizer';
      case 'iron': return 'Iron';
      default: return 'Application';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 style={{ marginBottom: '20px', color: '#495057' }}>
        {getTypeIcon(type)}
        {getTypeLabel(type)} History
      </h3>

      {applications.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <p>No {type} applications recorded yet.</p>
          <p>Add your first {type} application to get started!</p>
        </div>
      ) : (
        <div className="application-history">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              className="history-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div style={{ flex: 1 }}>
                <div className="history-date">
                  {new Date(app.date).toLocaleDateString()}
                </div>
                <div className="history-details">
                  {type === 'pgr' && `${app.ouncesPer1000} oz per 1,000 sq ft`}
                  {type === 'fertilizer' && `${app.rate} lbs per 1,000 sq ft`}
                  {type === 'iron' && `${app.rate} oz per 1,000 sq ft`}
                  {settings.squareFootage && (
                    <span> • Total: {type === 'pgr' || type === 'iron' ? 
                      ((app.ouncesPer1000 || app.rate) * settings.squareFootage / 1000).toFixed(1) : 
                      ((app.rate) * settings.squareFootage / 1000).toFixed(1)} {type === 'pgr' || type === 'iron' ? 'oz' : 'lbs'}</span>
                  )}
                  {app.productType && <span> • {app.productType}</span>}
                  {app.npk && <span> • NPK: {app.npk}</span>}
                  {app.notes && <span> • {app.notes}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Only allow editing the most recent PGR application */}
                {!(type === 'pgr' && index !== 0) && (
                  <button
                    onClick={() => onEdit(app)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title="Edit application"
                  >
                    <Edit size={16} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(app.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc3545',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  title="Delete application"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ApplicationScreen; 