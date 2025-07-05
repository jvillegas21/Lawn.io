import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sprout, MapPin, Ruler, Save, Check } from 'lucide-react';

const SettingsScreen = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const grassTypes = [
    'Kentucky Bluegrass',
    'Perennial Ryegrass',
    'Tall Fescue',
    'Fine Fescue',
    'Bermudagrass',
    'Zoysiagrass',
    'St. Augustinegrass',
    'Centipedegrass',
    'Buffalograss',
    'Other'
  ];

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding to get zip code
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              setFormData(prev => ({
                ...prev,
                zipCode: data.postcode || '',
                useGeolocation: true
              }));
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
            });
        },
        () => {
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ 
          marginBottom: '24px', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Sprout size={24} />
          Lawn Settings
        </h2>

        <div className="input-group">
          <label htmlFor="grassType">
            <Sprout size={16} style={{ marginRight: '8px' }} />
            Grass Type
          </label>
          <select
            id="grassType"
            value={formData.grassType}
            onChange={(e) => setFormData(prev => ({ ...prev, grassType: e.target.value }))}
          >
            <option value="">Select your grass type</option>
            {grassTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="zipCode">
            <MapPin size={16} style={{ marginRight: '8px' }} />
            Zip Code
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              id="zipCode"
              type="text"
              placeholder="Enter zip code"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-secondary"
              onClick={getCurrentLocation}
              disabled={isLoading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isLoading ? 'Getting...' : 'Auto Detect'}
            </button>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="useGeolocation">
            <Ruler size={16} style={{ marginRight: '8px' }} />
            Use Geolocation
          </label>
          <input
            id="useGeolocation"
            type="checkbox"
            checked={formData.useGeolocation}
            onChange={(e) => setFormData(prev => ({ ...prev, useGeolocation: e.target.checked }))}
          />
        </div>

        <div className="input-group">
          <label htmlFor="squareFootage">
            <Ruler size={16} style={{ marginRight: '8px' }} />
            Lawn Square Footage
          </label>
          <input
            id="squareFootage"
            type="number"
            placeholder="Enter square footage"
            value={formData.squareFootage}
            onChange={(e) => setFormData(prev => ({ ...prev, squareFootage: e.target.value }))}
          />
        </div>

        <motion.button
          className="btn"
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '16px'
          }}
        >
          {saved ? <Check size={20} /> : <Save size={20} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SettingsScreen; 