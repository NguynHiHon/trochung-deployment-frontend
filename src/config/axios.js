import axios from 'axios';

// Config axios một lần cho toàn project
axios.defaults.baseURL = 'https://trochung-deployment-backend.onrender.com';
 axios.defaults.withCredentials = true; 

export default axios;