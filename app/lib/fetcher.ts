import api from './api';
export const fetcher = (url: string) => api.get(url).then((r) => r.data);