import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Brain, 
  TestTube, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Leaf,
  Camera,
  FileImage,
  X,
  Save,
  Loader2,
  TrendingUp,
  Lightbulb,
  Target
} from 'lucide-react';
import { analyzeSoilReportWithGPT, parseSoilReportText } from '../utils/gptSoilAnalyzer';
import SoilHistory from './SoilHistory';
import { estimateNextApplication, calculateGDD, getGrassTypeBaseTemp } from '../utils/gddCalculator';

const SoilReportUpload = ({ onSoilDataUpdate, settings }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [soilReports, setSoilReports] = useState([]);
  const [manualData, setManualData] = useState({
    pH: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    calcium: '',
    magnesium: '',
    organicMatter: ''
  });

  // Load soil reports from localStorage on component mount
  useEffect(() => {
    const savedReports = localStorage.getItem('lawnSoilReports');
    if (savedReports) {
      try {
        setSoilReports(JSON.parse(savedReports));
      } catch (error) {
        console.error('Error parsing saved soil reports:', error);
        setSoilReports([]);
      }
    }
  }, []);

  // Save soil reports to localStorage
  const saveSoilReport = (soilData) => {
    const newReport = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...soilData
    };
    
    const updatedReports = [newReport, ...soilReports];
    setSoilReports(updatedReports);
    localStorage.setItem('lawnSoilReports', JSON.stringify(updatedReports));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let result;
      if (file.type.startsWith('image/') || file.name.endsWith('.pdf')) {
        result = await analyzeSoilReportWithGPT(file);
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        const text = await file.text();
        result = parseSoilReportText(text);
      } else {
        throw new Error('Unsupported file type. Please upload an image, PDF, TXT, or CSV file.');
      }

      setAnalysisResult({ success: true, data: result, message: 'Soil report analyzed successfully!' });
      saveSoilReport(result);
      onSoilDataUpdate(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({ 
        success: false, 
        message: error.message || 'Failed to analyze soil report. Please try again or use manual entry.' 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    const cleanedData = {};
    let hasData = false;
    
    Object.keys(manualData).forEach(key => {
      const value = parseFloat(manualData[key]);
      if (!isNaN(value) && value > 0) {
        cleanedData[key] = value;
        hasData = true;
      }
    });

    if (!hasData) {
      setAnalysisResult({ 
        success: false, 
        message: 'Please enter at least one soil measurement value.' 
      });
      return;
    }

    setAnalysisResult({ success: true, data: cleanedData, message: 'Manual data saved successfully!' });
    saveSoilReport(cleanedData);
    onSoilDataUpdate(cleanedData);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ 
          marginBottom: '32px', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <TestTube size={24} />
          <h2>Soil Report Analysis</h2>
        </div>

        {/* Tab Navigation */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={16} style={{ marginRight: '8px' }} />
            Upload Report
          </button>
          <button
            className={`nav-tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <FileText size={16} style={{ marginRight: '8px' }} />
            Manual Entry
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <TrendingUp size={16} style={{ marginRight: '8px' }} />
            History & Charts
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Upload Area */}
              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #e9ecef',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#f8f9fa' : '#ffffff',
                  borderColor: dragActive ? '#007bff' : '#e9ecef',
                  transition: 'all 0.2s ease',
                  marginBottom: '24px'
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <Brain size={48} style={{ color: '#007bff', marginBottom: '12px' }} />
                  <h3 style={{ marginBottom: '8px', color: '#495057' }}>
                    AI-Powered Soil Analysis
                  </h3>
                                     <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
                     Upload your soil test report (images, PDFs, or text files) for AI-powered analysis and recommendations
                   </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <label className="btn">
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    Upload Soil Report
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt,.csv"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                                 <p style={{ fontSize: '12px', color: '#adb5bd', marginTop: '16px' }}>
                   We can analyze images, PDFs, or text files - just upload your soil report in any format
                 </p>
              </div>

              {/* Analysis Status */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '24px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}
                >
                  <Loader2 size={32} style={{ color: '#007bff', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                  <p style={{ color: '#495057', marginBottom: '8px' }}>Analyzing your soil report...</p>
                  <p style={{ fontSize: '14px', color: '#6c757d' }}>This may take a few moments</p>
                </motion.div>
              )}

                             {/* Results */}
               {analysisResult && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   style={{
                     padding: '16px',
                     borderRadius: '8px',
                     backgroundColor: analysisResult.success ? '#d4edda' : '#f8d7da',
                     border: `1px solid ${analysisResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                     color: analysisResult.success ? '#155724' : '#721c24',
                     marginBottom: '16px'
                   }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                     {analysisResult.success ? (
                       <Check size={20} />
                     ) : (
                       <AlertCircle size={20} />
                     )}
                     <span style={{ fontWeight: '500' }}>{analysisResult.message}</span>
                   </div>
                   
                   {/* Show recommendations if available */}
                   {analysisResult.success && analysisResult.data?.recommendations && analysisResult.data.recommendations.length > 0 && (
                     <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                         <Lightbulb size={16} />
                         <span style={{ fontWeight: '500', fontSize: '14px' }}>AI Recommendations:</span>
                       </div>
                       <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                         {analysisResult.data.recommendations.map((rec, index) => (
                           <li key={index} style={{ marginBottom: '4px' }}>
                             {rec}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                   
                   {/* Show priority actions if available */}
                   {analysisResult.success && analysisResult.data?.priorityActions && analysisResult.data.priorityActions.length > 0 && (
                     <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                         <Target size={16} />
                         <span style={{ fontWeight: '500', fontSize: '14px' }}>Priority Actions:</span>
                       </div>
                       <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                         {analysisResult.data.priorityActions.map((action, index) => (
                           <li key={index} style={{ marginBottom: '4px' }}>
                             {action}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </motion.div>
               )}
            </motion.div>
          )}

          {activeTab === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleManualSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '16px', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Leaf size={20} />
                    Enter Soil Measurements
                  </h3>
                  <p style={{ color: '#6c757d', fontSize: '14px' }}>
                    Enter your soil test results below for analysis and recommendations
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div className="input-group">
                    <label htmlFor="pH">pH Level</label>
                    <input
                      id="pH"
                      type="number"
                      step="0.1"
                      min="4.0"
                      max="9.0"
                      value={manualData.pH}
                      onChange={(e) => setManualData({...manualData, pH: e.target.value})}
                      placeholder="6.5"
                    />
                    <small style={{ color: '#6c757d' }}>Optimal: 6.0-7.0</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="nitrogen">Nitrogen (ppm)</label>
                    <input
                      id="nitrogen"
                      type="number"
                      step="0.1"
                      min="1"
                      max="200"
                      value={manualData.nitrogen}
                      onChange={(e) => setManualData({...manualData, nitrogen: e.target.value})}
                      placeholder="25"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 20-60 ppm</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="phosphorus">Phosphorus (ppm)</label>
                    <input
                      id="phosphorus"
                      type="number"
                      step="0.1"
                      min="1"
                      max="100"
                      value={manualData.phosphorus}
                      onChange={(e) => setManualData({...manualData, phosphorus: e.target.value})}
                      placeholder="15"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 10-40 ppm</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="potassium">Potassium (ppm)</label>
                    <input
                      id="potassium"
                      type="number"
                      step="0.1"
                      min="10"
                      max="500"
                      value={manualData.potassium}
                      onChange={(e) => setManualData({...manualData, potassium: e.target.value})}
                      placeholder="150"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 100-300 ppm</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="calcium">Calcium (ppm)</label>
                    <input
                      id="calcium"
                      type="number"
                      step="1"
                      min="100"
                      max="3000"
                      value={manualData.calcium}
                      onChange={(e) => setManualData({...manualData, calcium: e.target.value})}
                      placeholder="800"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 500-1500 ppm</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="magnesium">Magnesium (ppm)</label>
                    <input
                      id="magnesium"
                      type="number"
                      step="1"
                      min="10"
                      max="500"
                      value={manualData.magnesium}
                      onChange={(e) => setManualData({...manualData, magnesium: e.target.value})}
                      placeholder="80"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 50-200 ppm</small>
                  </div>

                  <div className="input-group">
                    <label htmlFor="organicMatter">Organic Matter (%)</label>
                    <input
                      id="organicMatter"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="20"
                      value={manualData.organicMatter}
                      onChange={(e) => setManualData({...manualData, organicMatter: e.target.value})}
                      placeholder="3.5"
                    />
                    <small style={{ color: '#6c757d' }}>Typical: 2-6%</small>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px'
                  }}
                >
                  <Sparkles size={20} />
                  Analyze & Get Recommendations
                </motion.button>
              </form>

              {/* Manual Entry Results */}
              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: analysisResult.success ? '#d4edda' : '#f8d7da',
                    border: `1px solid ${analysisResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                    color: analysisResult.success ? '#155724' : '#721c24',
                    marginTop: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {analysisResult.success ? (
                      <Check size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                    <span>{analysisResult.message}</span>
                  </div>
                </motion.div>
              )}
                         </motion.div>
           )}

           {activeTab === 'history' && (
             <motion.div
               key="history"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
             >
               <SoilHistory soilReports={soilReports} />
             </motion.div>
           )}
         </AnimatePresence>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SoilReportUpload; 