// services/api.ts
import axios, { AxiosResponse } from 'axios';

// Define your base URL for the API
const api = axios.create({
  baseURL: 'http://192.168.1.3:3000', // your base URL
  timeout: 5000, // set a timeout if necessary
});

// Define types for request data and responses

// Define the shape of the data sent in the request (SurveyDetails)
interface PreSurveyDetails {
  SurveyID: string;
  ResultID: string;
  OutletName: string;
  State: string;
  country: string;
  Location: string;
  Address: string;
  Zone: string;
  StartDate: string;
  StartTime: string;
  EndDate: string;
  EndTime: string;
  ProjectId: string;
}


//survy questions
interface answeredQuestions {
  SurveyID: string;
  QuestionID: number;
  answerid: string;
  answertext: string;
  Location: string;
  remarks: string;
  Deviceid: string;
  projectid: string;
}

interface SubmitSurvey {
  PreSurveyDetails: PreSurveyDetails;
  answeredQuestions: answeredQuestions[];
  images?: { [key: number]: File }; // This will be a map of question ID to file (image)
}

// Define the shape of the response data
interface ApiResponse {
  success: boolean;
  message: string;
  status: string;
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
export const validateProjectId = (ProjectId: string, surveyId: string): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/validate-project', { ProjectId, surveyId });
};


export const getSurveyQuestions = (ProjectId: string, surveyId: string): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/get-questions', { ProjectId, surveyId });
};

export const submitPreSurveyDetails = (surveyData: SubmitSurvey): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/submit-survey', surveyData, {
  });
};

