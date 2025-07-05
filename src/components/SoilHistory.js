import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

const SoilHistory = ({ soilReports = [] }) => {
  const [selectedParameter, setSelectedParameter] = useState('pH');
  const [timeRange, setTimeRange] = useState('6months');

  const parameters = {
    pH: { label: 'pH Level', unit: '', optimal: { min: 6.0, max: 7.0 } },
    nitrogen: { label: 'Nitrogen', unit: 'ppm', optimal: { min: 20, max: 60 } },
    phosphorus: { label: 'Phosphorus', unit: 'ppm', optimal: { min: 10, max: 40 } },
    potassium: { label: 'Potassium', unit: 'ppm', optimal: { min: 100, max: 300 } },
    calcium: { label: 'Calcium', unit: 'ppm', optimal: { min: 500, max: 1500 } },
    magnesium: { label: 'Magnesium', unit: 'ppm', optimal: { min: 50, max: 200 } },
    organicMatter: { label: 'Organic Matter', unit: '%', optimal: { min: 2, max: 6 } }
  };

  const getFilteredReports = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return soilReports;
    }
    
    return soilReports.filter(report => new Date(report.date) >= cutoffDate);
  };

  const getParameterData = () => {
    const filteredReports = getFilteredReports();
    return filteredReports
      .filter(report => report[selectedParameter] !== null && report[selectedParameter] !== undefined)
      .map(report => ({
        date: new Date(report.date),
        value: report[selectedParameter],
        recommendations: report.recommendations || []
      }))
      .sort((a, b) => a.date - b.date);
  };

  const renderChart = () => {
    const data = getParameterData();
    if (data.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No data available for {parameters[selectedParameter].label}</p>
        </div>
      );
    }

    const values = data.map(d => d.value);
    const optimalRange = parameters[selectedParameter].optimal;
    let minValue = Math.min(Math.min(...values), optimalRange.min);
    let maxValue = Math.max(Math.max(...values), optimalRange.max);
    let range = maxValue - minValue;
    let padding = range === 0 ? 1 : range * 0.1;

    // If only one data point, expand the range for better Y-axis labels, but always include optimal range
    if (data.length === 1) {
      const v = values[0];
      minValue = Math.min(v, optimalRange.min);
      maxValue = Math.max(v, optimalRange.max);
      range = maxValue - minValue;
      padding = range === 0 ? 1 : range * 0.1;
    }

    const chartHeight = 320;
    const chartWidth = Math.max(600, data.length * 80);
    const leftMargin = 60; // increased for Y-axis labels
    const rightMargin = 30;
    const bottomMargin = 36; // increased for X-axis labels
    const topMargin = 10;

    const pointRadius = 6;

    const getX = (index) => {
      if (data.length === 1) return leftMargin + (chartWidth - leftMargin - rightMargin) / 2;
      return (index / (data.length - 1)) * (chartWidth - leftMargin - rightMargin) + leftMargin;
    };

    const getY = (value) => {
      const normalizedValue = ((value - (minValue - padding)) / (range + 2 * padding));
      return topMargin + chartHeight - (normalizedValue * chartHeight);
    };

    const points = data.map((point, index) => ({
      x: getX(index),
      y: getY(point.value),
      value: point.value,
      date: point.date
    }));

    const pathData = data.length > 1
      ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
      : '';

    const optimalY1 = getY(optimalRange.min);
    const optimalY2 = getY(optimalRange.max);

    return (
      <div style={{ overflowX: 'auto' }}>
        {/* Chart Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ display: 'inline-block', width: 16, height: 8, background: '#e8f5e8', border: '2px dashed #28a745', marginRight: 2 }} />
            <span>Optimal Range</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="#28a745" stroke="white" strokeWidth="2" /></svg>
            <span>Data Point (Optimal)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="16" height="16"><circle cx="8" cy="8" r="6" fill="#dc3545" stroke="white" strokeWidth="2" /></svg>
            <span>Data Point (Out of Range)</span>
          </div>
        </div>
        <svg width={chartWidth} height={chartHeight + topMargin + bottomMargin} style={{ marginBottom: '20px', background: '#fff' }}>
          {/* Y-axis line */}
          <line x1={leftMargin} y1={topMargin} x2={leftMargin} y2={topMargin + chartHeight} stroke="#adb5bd" strokeWidth="2" />
          {/* X-axis line */}
          <line x1={leftMargin} y1={topMargin + chartHeight} x2={chartWidth - rightMargin} y2={topMargin + chartHeight} stroke="#adb5bd" strokeWidth="2" />
          {/* Y-axis ticks and labels */}
          {Array.from({ length: 5 }, (_, i) => {
            const value = minValue - padding + ((range + 2 * padding) * (4 - i) / 4);
            const y = topMargin + (i / 4) * chartHeight;
            return (
              <g key={`y-label-${i}`}>
                <line x1={leftMargin - 5} y1={y} x2={leftMargin} y2={y} stroke="#adb5bd" strokeWidth="2" />
                <text
                  x={leftMargin - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6c757d"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}
          {/* X-axis ticks and labels */}
          {data.map((point, index) => (
            <g key={`x-label-${index}`}> 
              <line x1={getX(index)} y1={topMargin + chartHeight} x2={getX(index)} y2={topMargin + chartHeight + 8} stroke="#adb5bd" strokeWidth="2" />
              <text
                x={getX(index)}
                y={topMargin + chartHeight + 24}
                textAnchor="middle"
                fontSize="12"
                fill="#6c757d"
              >
                {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>
          ))}
          {/* Optimal range background */}
          <rect
            x={leftMargin}
            y={Math.min(optimalY1, optimalY2)}
            width={chartWidth - leftMargin - rightMargin}
            height={Math.abs(optimalY2 - optimalY1)}
            fill="#e8f5e8"
            opacity="0.85"
            style={{ stroke: '#28a745', strokeWidth: 2, strokeDasharray: '8,4' }}
          />
          {/* Optimal range lines */}
          <line
            x1={leftMargin}
            y1={optimalY1}
            x2={chartWidth - rightMargin}
            y2={optimalY1}
            stroke="#28a745"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <line
            x1={leftMargin}
            y1={optimalY2}
            x2={chartWidth - rightMargin}
            y2={optimalY2}
            stroke="#28a745"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* Grid lines */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = topMargin + (i / 4) * chartHeight;
            return (
              <line
                key={`grid-${i}`}
                x1={leftMargin}
                y1={y}
                x2={chartWidth - rightMargin}
                y2={y}
                stroke="#e9ecef"
                strokeWidth="1"
              />
            );
          })}
          {/* Line chart */}
          {data.length > 1 && (
            <path
              d={points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')}
              stroke="#667eea"
              strokeWidth="3"
              fill="none"
            />
          )}
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={pointRadius}
              fill={point.value >= optimalRange.min && point.value <= optimalRange.max ? "#28a745" : "#dc3545"}
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  };

  const getLatestReport = () => {
    if (soilReports.length === 0) return null;
    return soilReports.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  const getParameterStatus = (value) => {
    const optimal = parameters[selectedParameter].optimal;
    if (value >= optimal.min && value <= optimal.max) {
      return { status: 'optimal', icon: CheckCircle, color: '#28a745' };
    } else if (value < optimal.min) {
      return { status: 'low', icon: AlertTriangle, color: '#ffc107' };
    } else {
      return { status: 'high', icon: AlertTriangle, color: '#dc3545' };
    }
  };

  const latestReport = getLatestReport();
  const currentData = getParameterData();
  const latestValue = latestReport?.[selectedParameter];

  return (
    <div className="card">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div style={{ 
          marginBottom: '24px', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <TrendingUp size={24} />
          <h2>Soil Test History</h2>
        </div>

        {soilReports.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            color: '#6c757d',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No soil test history available</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Upload your first soil test to start tracking your lawn's progress
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <div className="input-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                <label>Parameter</label>
                <select
                  value={selectedParameter}
                  onChange={(e) => setSelectedParameter(e.target.value)}
                >
                  {Object.keys(parameters).map(param => (
                    <option key={param} value={param}>
                      {parameters[param].label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="input-group" style={{ marginBottom: 0, minWidth: '150px' }}>
                <label>Time Range</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Current Status */}
            {latestValue !== null && latestValue !== undefined && (
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Target size={20} />
                  <h3 style={{ margin: 0, color: '#495057' }}>
                    Current {parameters[selectedParameter].label}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: getParameterStatus(latestValue).color
                  }}>
                    {latestValue} {parameters[selectedParameter].unit}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {React.createElement(getParameterStatus(latestValue).icon, {
                      size: 16,
                      color: getParameterStatus(latestValue).color
                    })}
                    <span style={{ 
                      fontSize: '14px',
                      color: getParameterStatus(latestValue).color,
                      textTransform: 'capitalize'
                    }}>
                      {getParameterStatus(latestValue).status}
                    </span>
                  </div>
                </div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6c757d', 
                  margin: '8px 0 0 0'
                }}>
                  Optimal range: {parameters[selectedParameter].optimal.min} - {parameters[selectedParameter].optimal.max} {parameters[selectedParameter].unit}
                </p>
              </div>
            )}

            {/* Chart */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#495057' }}>
                Progress Over Time
              </h3>
              {renderChart()}
            </div>

            {/* Latest Recommendations */}
            {latestReport?.recommendations && latestReport.recommendations.length > 0 && (
              <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '16px', 
                borderRadius: '12px',
                borderLeft: '4px solid #2196f3'
              }}>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Clock size={20} />
                  Latest Recommendations
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {latestReport.recommendations.map((rec, index) => (
                    <li key={index} style={{ marginBottom: '8px', color: '#1976d2' }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SoilHistory; 