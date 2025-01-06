// services/api.ts
import axios, { AxiosResponse } from 'axios';

// Define your base URL for the API
const api = axios.create({
  baseURL: 'http://192.168.1.153:3000', // your base URL
  timeout: 5000, // set a timeout if necessary
});

// Define types for request data and responses

// Define the shape of the data sent in the request (SurveyDetails)
interface PreSurveyDetails {
  productId: string;
  surveyId: string;
  address: string;
  country: string;
  location: string;
  outletName: string;
  startZone: string;
}

// Define the shape of the response data
interface ApiResponse {
  success: boolean;
  message: string;
}

// Add request interceptors to add headers (for example, Authorization)
api.interceptors.request.use((config) => {
  // Add authentication token or other headers here (if required)
  // const token = getTokenFromSomewhere(); // For example, using AsyncStorage
  // if (token) {
  //   config.headers['Authorization'] = `Bearer ${token}`;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptors (for error handling, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally (you can show a Toast or handle error responses)
    return Promise.reject(error);
  }
);

// API Call to submit survey details (POST request)
export const validateProductId = (productId:string, surveyId:string ): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/survey/validate-project', { productId, surveyId });
  };
  

export const submitPreSurveyDetails = ( surveyData: PreSurveyDetails ): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/survey/pre-survey-details', surveyData);
  };

  export const getSurveyQuestions = (productId:string, surveyId:string): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/survey/get-questions', { productId, surveyId });
  };
