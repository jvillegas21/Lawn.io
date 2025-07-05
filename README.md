# Lawn Care Tracker

A modern web application to track PGR (Plant Growth Regulator), fertilizer, and iron applications for your lawn maintenance with AI-powered soil analysis and real-time weather data.

## Features

- **AI-Powered Soil Analysis**: Upload photos of soil test reports and let GPT-4 Vision extract data automatically
- **Multiple Application Tracking**: Track PGR, fertilizer, and iron applications separately
- **NPK-Based Recommendations**: Intelligent fertilizer recommendations based on product type and soil data
- **Real-time Weather**: Live weather data from OpenWeatherMap API
- **GDD Calculations**: Growing Degree Days calculations based on your grass type and current weather
- **Soil Health Analysis**: Comprehensive soil health scoring and recommendations
- **Settings Management**: Configure grass type, location, and lawn square footage
- **Local Storage**: All data stored locally in your browser
- **Responsive Design**: Works great on desktop and mobile devices

## Setup

### 1. Get API Keys

#### OpenAI API Key (for AI soil analysis)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key

#### OpenWeatherMap API Key (for weather data)
1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm start
```

### 5. Open Application

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### AI Soil Analysis
1. Navigate to the Soil Report tab
2. Take a photo of your soil test report
3. Upload the photo - AI will automatically extract:
   - pH level
   - Nitrogen (N)
   - Phosphorus (P)
   - Potassium (K)
   - Calcium
   - Magnesium
   - Organic Matter
4. Review the extracted data and complete any missing fields
5. Get instant soil health analysis and recommendations

### Applications
1. Navigate to the Applications tab
2. Add PGR, fertilizer, or iron applications
3. View recommendations for next applications based on:
   - Product type and NPK ratios
   - Soil test results
   - Grass type and weather conditions
4. Track application history and statistics

### Settings
1. Configure your grass type, location, and lawn size
2. Weather data will automatically update for GDD calculations

## AI Features

### GPT-4 Vision Integration
- **Automatic Data Extraction**: Upload photos of soil test reports
- **Multiple Format Support**: Works with various lab report formats
- **Handwritten Text**: Can read handwritten values
- **Context Understanding**: Understands different units and notations
- **Error Handling**: Falls back to manual entry if needed

### Intelligent Recommendations
- **Soil-Based**: Adjusts recommendations based on soil test results
- **Product-Specific**: Considers NPK ratios and application rates
- **Weather-Aware**: Incorporates current weather conditions
- **Grass-Type Optimized**: Tailored to your specific grass type

## Technology Stack

- React 18
- OpenAI GPT-4 Vision API
- OpenWeatherMap API
- Framer Motion (animations)
- Lucide React (icons)
- Local Storage (data persistence)

## API Usage

### OpenAI API
- Uses GPT-4 Vision for image analysis
- Processes soil test report photos
- Extracts structured data in JSON format
- Rate limits apply based on your OpenAI plan

### OpenWeatherMap API
- Current weather and 5-day forecast
- Up to 1,000 API calls per day (free tier)
- Used for GDD calculations

## Future Enhancements

- User authentication and cloud storage
- Database integration
- Historical weather data for more accurate GDD tracking
- Push notifications for application reminders
- Export/import functionality
- Multiple lawn support
- Advanced GDD models with historical data
- Integration with smart irrigation systems

## License

MIT License