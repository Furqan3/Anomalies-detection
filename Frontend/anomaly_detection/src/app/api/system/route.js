import axios from 'axios';



const API_URL = 'http://127.0.0.1:8000';

export const get_data = async (duration, interval) => {
  const response = await axios.get(`${API_URL}/get_data`, { duration, interval });

  return response.data;
};
