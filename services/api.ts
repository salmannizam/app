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
  SurveyID: string;
  ResultID: string;
  OutletName: string;
  State: string;
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
interface SurveyQuestionsAnswer {
  SurveyID: string;
  QuestionID: number;
  answerid: string;
  answertext: string;
  Location: string;
  remarks: string;
  Deviceid: string;
  projectid: string;
}

//SUBMIT SURVEY
interface SubmitSurvey {
  PreSurveyDetails: PreSurveyDetails;
  SurveyQuestionsAnswer: SurveyQuestionsAnswer[];
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
export const validateProjectId = (projectId: string, surveyId: string): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/validate-project', { projectId, surveyId });
};


export const getSurveyQuestions = (projectId: string, surveyId: string): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/get-questions', { projectId, surveyId });
};

export const submitPreSurveyDetails = (formData: FormData): Promise<AxiosResponse<ApiResponse>> => {
  return api.post('/survey/submit-survey', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Ensure the request is sent with the proper content type
    },
  });
};

