// GDD (Growing Degree Days) Calculator with OpenWeatherMap integration
// Base temperature for cool-season grasses is typically 50°F (10°C)
// Base temperature for warm-season grasses is typically 60°F (15.6°C)

export const calculateGDD = (maxTemp, minTemp, baseTemp = 50) => {
  const avgTemp = (maxTemp + minTemp) / 2;
  return Math.max(0, avgTemp - baseTemp);
};

export const getGrassTypeBaseTemp = (grassType) => {
  const coolSeasonGrasses = [
    'Kentucky Bluegrass',
    'Perennial Ryegrass', 
    'Tall Fescue',
    'Fine Fescue'
  ];
  
  const warmSeasonGrasses = [
    'Bermudagrass',
    'Zoysiagrass',
    'St. Augustinegrass',
    'Centipedegrass',
    'Buffalograss'
  ];

  if (coolSeasonGrasses.includes(grassType)) {
    return 50; // 50°F for cool-season grasses
  } else if (warmSeasonGrasses.includes(grassType)) {
    return 60; // 60°F for warm-season grasses
  }
  
  return 50; // Default to cool-season base temp
};

export const estimateNextApplication = (lastApplicationDate, currentGDD, targetGDD = 1000) => {
  if (!lastApplicationDate || !currentGDD) return null;
  
  const lastDate = new Date(lastApplicationDate);
  const today = new Date();
  const daysSinceLastApp = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
  
  // Calculate GDD accumulation rate per day
  const gddPerDay = currentGDD / Math.max(1, daysSinceLastApp);
  
  // For PGR applications, typical intervals are 2-4 weeks (14-28 days)
  // Let's use a more realistic approach based on typical application intervals
  const typicalIntervals = [14, 21, 28, 35]; // days
  
  // Calculate which interval we're closest to based on current GDD accumulation
  let recommendedInterval = 21; // default to 3 weeks
  
  if (gddPerDay > 15) {
    // High GDD accumulation - shorter interval
    recommendedInterval = 14;
  } else if (gddPerDay > 10) {
    // Medium GDD accumulation - standard interval
    recommendedInterval = 21;
  } else if (gddPerDay > 5) {
    // Lower GDD accumulation - longer interval
    recommendedInterval = 28;
  } else {
    // Very low GDD accumulation - extended interval
    recommendedInterval = 35;
  }
  
  // Calculate days until next application
  const daysUntilNext = Math.max(0, recommendedInterval - daysSinceLastApp);
  
  if (daysUntilNext <= 0) {
    return { 
      daysUntilNext: 0, 
      message: 'Ready for next application!',
      gddPerDay: gddPerDay.toFixed(1),
      recommendedInterval
    };
  }
  
  return {
    daysUntilNext,
    message: `Estimated ${daysUntilNext} days until next application (${gddPerDay.toFixed(1)} GDD/day)`,
    gddPerDay: gddPerDay.toFixed(1),
    recommendedInterval
  };
};

// OpenWeatherMap API integration - try multiple possible environment variable names
const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 
                           process.env.REACT_APP_WEATHER_API_KEY ||
                           process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const getCurrentWeather = async (zipCode, countryCode = 'US') => {
  // Check if API key is available
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not found. Please add one of the following to your .env file:\n' +
                   '- REACT_APP_OPENWEATHER_API_KEY\n' +
                   '- REACT_APP_WEATHER_API_KEY\n' +
                   '- OPENWEATHER_API_KEY');
  }

  try {
    // Get current weather
    const currentResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?zip=${zipCode},${countryCode}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    if (!currentResponse.ok) {
      if (currentResponse.status === 401) {
        throw new Error('Invalid OpenWeatherMap API key. Please check your API key.');
      } else if (currentResponse.status === 404) {
        throw new Error('Location not found. Please check your zip code.');
      } else {
        throw new Error(`Weather API error: ${currentResponse.status}`);
      }
    }
    
    const currentData = await currentResponse.json();
    
    // Get 5-day forecast for better GDD calculation
    const forecastResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?zip=${zipCode},${countryCode}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    if (!forecastResponse.ok) {
      if (forecastResponse.status === 401) {
        throw new Error('Invalid OpenWeatherMap API key. Please check your API key.');
      } else {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }
    }
    
    const forecastData = await forecastResponse.json();
    
    // Calculate average temperatures for the next few days
    const today = new Date();
    const nextDays = forecastData.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate > today && itemDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    });
    
    const avgMaxTemp = nextDays.reduce((sum, item) => sum + item.main.temp_max, 0) / nextDays.length;
    const avgMinTemp = nextDays.reduce((sum, item) => sum + item.main.temp_min, 0) / nextDays.length;
    
    return {
      current: {
        temp: currentData.main.temp,
        maxTemp: currentData.main.temp_max,
        minTemp: currentData.main.temp_min,
        humidity: currentData.main.humidity,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon
      },
      forecast: {
        avgMaxTemp: avgMaxTemp || currentData.main.temp_max,
        avgMinTemp: avgMinTemp || currentData.main.temp_min
      },
      location: {
        city: currentData.name,
        country: currentData.sys.country,
        zipCode: zipCode
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      throw new Error('Weather API key not configured. Please add one of the following to your .env file:\n' +
                     '- REACT_APP_OPENWEATHER_API_KEY\n' +
                     '- REACT_APP_WEATHER_API_KEY\n' +
                     '- OPENWEATHER_API_KEY');
    } else if (error.message.includes('Location not found')) {
      throw new Error('Location not found. Please check your zip code and try again.');
    } else {
      throw new Error('Unable to fetch weather data. Please check your internet connection and try again.');
    }
  }
};

// Calculate GDD for a specific date range
export const calculateGDDForPeriod = (weatherData, baseTemp, startDate, endDate) => {
  if (!weatherData || !weatherData.forecast) return 0;
  
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const dailyGDD = calculateGDD(weatherData.forecast.avgMaxTemp, weatherData.forecast.avgMinTemp, baseTemp);
  
  return dailyGDD * daysDiff;
};

// Get weather icon URL
export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}; 