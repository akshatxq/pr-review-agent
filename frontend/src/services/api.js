import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const fetchReviews = async () => {
  const { data } = await api.get('/reviews');
  return data;
};

export const fetchReviewById = async (id) => {
  const { data } = await api.get(`/reviews/${id}`);
  return data;
};

export const fetchRepos = async () => {
  const { data } = await api.get('/reviews/repos/all');
  return data;
};

export default api;