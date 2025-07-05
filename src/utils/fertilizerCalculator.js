// Fertilizer and Nutrient Management Calculator

// Common fertilizer types and their typical application intervals
export const FERTILIZER_TYPES = {
  'Scotts Turf Builder': { npk: '32-0-4', interval: 6, slowRelease: true },
  'Milorganite': { npk: '6-4-0', interval: 8, organic: true },
  'Lesco Professional': { npk: '18-0-6', interval: 6, slowRelease: true },
  'Pennington UltraGreen': { npk: '30-0-4', interval: 6, slowRelease: true },
  'Custom Mix': { npk: 'custom', interval: 6, slowRelease: false }
};

// Iron product types
export const IRON_PRODUCTS = {
  'Ferrous Sulfate': { ironContent: 20, interval: 4, liquid: false },
  'Chelated Iron': { ironContent: 6, interval: 4, liquid: true },
  'Ironite': { ironContent: 1.5, interval: 6, granular: true },
  'Custom Iron': { ironContent: 'custom', interval: 4, liquid: false }
};

// Soil test interpretation ranges
export const SOIL_RANGES = {
  pH: { low: 5.5, optimal: 6.5, high: 7.5 },
  nitrogen: { low: 20, optimal: 40, high: 60 }, // ppm
  phosphorus: { low: 10, optimal: 20, high: 40 }, // ppm
  potassium: { low: 100, optimal: 200, high: 300 }, // ppm
  calcium: { low: 500, optimal: 1000, high: 1500 }, // ppm
  magnesium: { low: 50, optimal: 100, high: 200 }, // ppm
  organicMatter: { low: 2, optimal: 4, high: 6 } // %
};

export const calculateNextFertilizerApplication = (lastApplication, fertilizerType, grassType, soilData = null) => {
  if (!lastApplication || !fertilizerType) return null;
  
  const lastDate = new Date(lastApplication.date);
  const today = new Date();
  const daysSinceLastApp = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
  
  let baseInterval = FERTILIZER_TYPES[fertilizerType]?.interval || 6;
  
  // Adjust based on grass type
  if (grassType) {
    const coolSeasonGrasses = ['Kentucky Bluegrass', 'Perennial Ryegrass', 'Tall Fescue', 'Fine Fescue'];
    const warmSeasonGrasses = ['Bermudagrass', 'Zoysiagrass', 'St. Augustinegrass', 'Centipedegrass', 'Buffalograss'];
    
    if (coolSeasonGrasses.includes(grassType)) {
      // Cool season grasses need more frequent feeding
      baseInterval = Math.max(4, baseInterval - 1);
    } else if (warmSeasonGrasses.includes(grassType)) {
      // Warm season grasses can go longer between applications
      baseInterval = Math.min(8, baseInterval + 1);
    }
  }
  
  // Adjust based on soil data if available
  if (soilData) {
    if (soilData.nitrogen < SOIL_RANGES.nitrogen.low) {
      baseInterval = Math.max(4, baseInterval - 1); // More frequent if N is low
    } else if (soilData.nitrogen > SOIL_RANGES.nitrogen.high) {
      baseInterval = Math.min(8, baseInterval + 1); // Less frequent if N is high
    }
    
    if (soilData.organicMatter < SOIL_RANGES.organicMatter.low) {
      baseInterval = Math.max(4, baseInterval - 1); // More frequent if OM is low
    }
  }
  
  const daysUntilNext = Math.max(0, baseInterval * 30 - daysSinceLastApp); // Convert months to days
  
  if (daysUntilNext <= 0) {
    return {
      daysUntilNext: 0,
      message: 'Ready for next fertilizer application!',
      interval: baseInterval,
      recommendations: generateFertilizerRecommendations(fertilizerType, soilData)
    };
  }
  
  return {
    daysUntilNext,
    message: `Estimated ${daysUntilNext} days until next fertilizer application`,
    interval: baseInterval,
    recommendations: generateFertilizerRecommendations(fertilizerType, soilData)
  };
};

export const calculateNextIronApplication = (lastApplication, ironProduct, grassType, soilData = null) => {
  if (!lastApplication || !ironProduct) return null;
  
  const lastDate = new Date(lastApplication.date);
  const today = new Date();
  const daysSinceLastApp = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
  
  let baseInterval = IRON_PRODUCTS[ironProduct]?.interval || 4;
  
  // Adjust based on grass type
  if (grassType) {
    const coolSeasonGrasses = ['Kentucky Bluegrass', 'Perennial Ryegrass', 'Tall Fescue', 'Fine Fescue'];
    if (coolSeasonGrasses.includes(grassType)) {
      baseInterval = Math.max(3, baseInterval - 1); // Cool season grasses benefit from more iron
    }
  }
  
  // Adjust based on soil pH if available
  if (soilData && soilData.pH) {
    if (soilData.pH > 7.0) {
      baseInterval = Math.max(3, baseInterval - 1); // More frequent if pH is high (iron less available)
    } else if (soilData.pH < 6.0) {
      baseInterval = Math.min(6, baseInterval + 1); // Less frequent if pH is low (iron more available)
    }
  }
  
  const daysUntilNext = Math.max(0, baseInterval * 30 - daysSinceLastApp);
  
  if (daysUntilNext <= 0) {
    return {
      daysUntilNext: 0,
      message: 'Ready for next iron application!',
      interval: baseInterval
    };
  }
  
  return {
    daysUntilNext,
    message: `Estimated ${daysUntilNext} days until next iron application`,
    interval: baseInterval
  };
};

export const generateFertilizerRecommendations = (fertilizerType, soilData = null) => {
  const recommendations = [];
  
  if (!soilData) {
    recommendations.push('Upload a soil test for personalized recommendations');
    return recommendations;
  }
  
  // pH recommendations
  if (soilData.pH < SOIL_RANGES.pH.low) {
    recommendations.push('Consider lime application to raise soil pH');
  } else if (soilData.pH > SOIL_RANGES.pH.high) {
    recommendations.push('Consider sulfur application to lower soil pH');
  }
  
  // Nitrogen recommendations
  if (soilData.nitrogen < SOIL_RANGES.nitrogen.low) {
    recommendations.push('Increase nitrogen application rate or frequency');
  } else if (soilData.nitrogen > SOIL_RANGES.nitrogen.high) {
    recommendations.push('Reduce nitrogen application rate');
  }
  
  // Phosphorus recommendations
  if (soilData.phosphorus < SOIL_RANGES.phosphorus.low) {
    recommendations.push('Consider phosphorus-rich fertilizer or starter fertilizer');
  }
  
  // Potassium recommendations
  if (soilData.potassium < SOIL_RANGES.potassium.low) {
    recommendations.push('Consider potassium supplement or balanced fertilizer');
  }
  
  // Organic matter recommendations
  if (soilData.organicMatter < SOIL_RANGES.organicMatter.low) {
    recommendations.push('Consider organic amendments like compost or humic acid');
  }
  
  return recommendations;
};

export const analyzeSoilReport = (soilData) => {
  const analysis = {
    overall: 'Good',
    issues: [],
    recommendations: [],
    score: 0
  };
  
  let score = 0;
  const totalFactors = Object.keys(SOIL_RANGES).length;
  
  // Analyze each soil parameter
  Object.keys(SOIL_RANGES).forEach(param => {
    const value = soilData[param];
    const ranges = SOIL_RANGES[param];
    
    if (value < ranges.low) {
      analysis.issues.push(`${param} is too low (${value})`);
      score += 0;
    } else if (value > ranges.high) {
      analysis.issues.push(`${param} is too high (${value})`);
      score += 0.5;
    } else if (value >= ranges.optimal - (ranges.optimal - ranges.low) * 0.2 && 
               value <= ranges.optimal + (ranges.high - ranges.optimal) * 0.2) {
      score += 1; // Optimal range
    } else {
      score += 0.7; // Acceptable range
    }
  });
  
  analysis.score = Math.round((score / totalFactors) * 100);
  
  if (analysis.score >= 80) {
    analysis.overall = 'Excellent';
  } else if (analysis.score >= 60) {
    analysis.overall = 'Good';
  } else if (analysis.score >= 40) {
    analysis.overall = 'Fair';
  } else {
    analysis.overall = 'Poor';
  }
  
  analysis.recommendations = generateFertilizerRecommendations(null, soilData);
  
  return analysis;
}; 