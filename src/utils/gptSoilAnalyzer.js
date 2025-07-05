// GPT-4 Vision integration for soil report analysis

// Try multiple possible environment variable names for OpenAI API key
const GPT_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 
                   process.env.REACT_APP_GPT_API_KEY ||
                   process.env.OPENAI_API_KEY;
const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

// Test function to verify API key is working
export const testOpenAIAPI = async () => {
  if (!GPT_API_KEY) {
    throw new Error('OpenAI API key not found. Please add one of the following to your .env file:\n' +
                   '- REACT_APP_OPENAI_API_KEY\n' +
                   '- REACT_APP_GPT_API_KEY\n' +
                   '- OPENAI_API_KEY');
  }

  try {
    console.log('Testing OpenAI API with key:', GPT_API_KEY.substring(0, 10) + '...');
    
    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 10
      })
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (response.status === 404) {
        throw new Error('OpenAI API endpoint not found. Please check your API configuration.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}\nResponse: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('API Success response:', data);
    return true;
    
  } catch (error) {
    console.error('OpenAI API test failed:', error);
    throw error;
  }
};

// Test GPT-4 Vision access specifically
export const testGPT4VisionAccess = async () => {
  if (!GPT_API_KEY) {
    throw new Error('OpenAI API key not found.');
  }

  try {
    console.log('Testing GPT-4 Vision access...');
    
    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'This is a test message.'
              }
            ]
          }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      console.log('GPT-4 Vision access confirmed');
      return true;
    } else {
      const errorText = await response.text();
      console.error('GPT-4 Vision test failed:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('GPT-4 Vision test error:', error);
    return false;
  }
};

export const analyzeSoilReportWithGPT = async (imageFile) => {
  // Check if API key is available
  if (!GPT_API_KEY) {
    throw new Error('OpenAI API key not found. Please add one of the following to your .env file:\n' +
                   '- REACT_APP_OPENAI_API_KEY\n' +
                   '- REACT_APP_GPT_API_KEY\n' +
                   '- OPENAI_API_KEY');
  }

  console.log('Starting GPT analysis with key:', GPT_API_KEY.substring(0, 10) + '...');

  try {
    // First, test if we have access to GPT-4 Vision
    const hasVisionAccess = await testGPT4VisionAccess();
    if (!hasVisionAccess) {
      throw new Error('GPT-4 Vision model not available. You may need to upgrade your OpenAI account or use the manual entry option.');
    }

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    console.log('Image converted to base64, size:', base64Image.length);
    
    // Prepare the prompt for GPT
    const prompt = `Please analyze this soil test report and provide both the data extraction and intelligent recommendations.

    First, extract the following values in JSON format:
    {
      "pH": number,
      "nitrogen": number (in ppm),
      "phosphorus": number (in ppm), 
      "potassium": number (in ppm),
      "calcium": number (in ppm),
      "magnesium": number (in ppm),
      "organicMatter": number (in percentage)
    }

    If a value is not found or unclear, use null.

    Then, provide intelligent recommendations based on the soil data. Consider:
    - pH levels (optimal: 6.0-7.0)
    - Nitrogen levels (optimal: 20-60 ppm)
    - Phosphorus levels (optimal: 10-40 ppm)
    - Potassium levels (optimal: 100-300 ppm)
    - Calcium levels (optimal: 500-1500 ppm)
    - Magnesium levels (optimal: 50-200 ppm)
    - Organic matter (optimal: 2-6%)

    Return your response in this exact format:
    {
      "soilData": { ... extracted values ... },
      "recommendations": [
        "Specific recommendation 1",
        "Specific recommendation 2",
        "Specific recommendation 3"
      ],
      "overallAssessment": "Brief overall assessment of soil health",
      "priorityActions": [
        "Most important action to take",
        "Second priority action"
      ]
    }

    Common variations to look for:
    - pH might be listed as "pH", "pH Level", or just a number
    - Nitrogen might be "N", "Nitrogen", "Total N"
    - Phosphorus might be "P", "Phosphorus", "P2O5"
    - Potassium might be "K", "Potassium", "K2O"
    - Calcium might be "Ca", "Calcium"
    - Magnesium might be "Mg", "Magnesium"
    - Organic Matter might be "OM", "Organic Matter", "Organic Carbon"`;

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    };

    console.log('Sending request to OpenAI API...');
    console.log('Request body model:', requestBody.model);

    const response = await fetch(GPT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (response.status === 404) {
        throw new Error('GPT-4 Vision model not available. You may need to upgrade your OpenAI account or use the manual entry option.');
      } else if (response.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}\nResponse: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('API Success response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API.');
    }
    
    const content = data.choices[0].message.content;
    console.log('GPT Response content:', content);
    
    // Parse the JSON response - handle markdown code blocks
    let soilData;
    try {
      // First try to parse as-is
      soilData = JSON.parse(content);
    } catch (parseError) {
      // If that fails, try to extract JSON from markdown code blocks
      try {
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          soilData = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON object without code blocks
          const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            soilData = JSON.parse(jsonObjectMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }
      } catch (secondParseError) {
        console.error('Failed to parse GPT response as JSON:', content);
        throw new Error('Failed to parse soil data from GPT response.');
      }
    }
    
    // Check if response has the new format with recommendations
    if (soilData.soilData && soilData.recommendations) {
      // New format with recommendations
      const cleanedSoilData = validateAndCleanSoilData(soilData.soilData);
      return {
        ...cleanedSoilData,
        recommendations: soilData.recommendations || [],
        overallAssessment: soilData.overallAssessment || '',
        priorityActions: soilData.priorityActions || []
      };
    } else {
      // Old format - just soil data
      return validateAndCleanSoilData(soilData);
    }
    
  } catch (error) {
    console.error('Error analyzing soil report with GPT:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      throw new Error('OpenAI API key not configured. Please add one of the following to your .env file:\n' +
                     '- REACT_APP_OPENAI_API_KEY\n' +
                     '- REACT_APP_GPT_API_KEY\n' +
                     '- OPENAI_API_KEY');
    } else if (error.message.includes('rate limit')) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a few minutes.');
    } else if (error.message.includes('Invalid OpenAI API key')) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    } else if (error.message.includes('model not available') || error.message.includes('GPT-4 Vision')) {
      throw new Error('GPT-4 Vision model not available. You may need to upgrade your OpenAI account or use the manual entry option.');
    } else {
      throw new Error('Failed to analyze soil report. Please try again or enter data manually.');
    }
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const validateAndCleanSoilData = (soilData) => {
  const validRanges = {
    pH: { min: 4.0, max: 9.0 },
    nitrogen: { min: 1, max: 200 },
    phosphorus: { min: 1, max: 100 },
    potassium: { min: 10, max: 500 },
    calcium: { min: 100, max: 3000 },
    magnesium: { min: 10, max: 500 },
    organicMatter: { min: 0.1, max: 20 }
  };

  const cleaned = {};
  
  Object.keys(soilData).forEach(param => {
    const value = soilData[param];
    
    // Skip null/undefined values
    if (value === null || value === undefined) return;
    
    const numValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numValue)) return;
    
    // Check if it's within reasonable range
    const range = validRanges[param];
    if (range && numValue >= range.min && numValue <= range.max) {
      cleaned[param] = numValue;
    }
  });
  
  return cleaned;
};

// Fallback text parser for when GPT fails
export const parseSoilReportText = (text) => {
  const soilData = {};
  
  const patterns = {
    pH: [
      /pH[:\s]*([0-9.]+)/i,
      /pH\s*Level[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*pH/i
    ],
    nitrogen: [
      /nitrogen[:\s]*([0-9.]+)/i,
      /N[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*ppm\s*N/i
    ],
    phosphorus: [
      /phosphorus[:\s]*([0-9.]+)/i,
      /P[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*ppm\s*P/i
    ],
    potassium: [
      /potassium[:\s]*([0-9.]+)/i,
      /K[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*ppm\s*K/i
    ],
    calcium: [
      /calcium[:\s]*([0-9.]+)/i,
      /Ca[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*ppm\s*Ca/i
    ],
    magnesium: [
      /magnesium[:\s]*([0-9.]+)/i,
      /Mg[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*ppm\s*Mg/i
    ],
    organicMatter: [
      /organic\s*matter[:\s]*([0-9.]+)/i,
      /OM[:\s]*([0-9.]+)/i,
      /([0-9.]+)\s*%\s*OM/i
    ]
  };
  
  Object.keys(patterns).forEach(param => {
    for (const pattern of patterns[param]) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1]);
        if (!isNaN(value) && value > 0) {
          soilData[param] = value;
          break;
        }
      }
    }
  });
  
  return soilData;
}; 