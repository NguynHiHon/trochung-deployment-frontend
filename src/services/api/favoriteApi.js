import axiosJWT from '../../config/axiosJWT';

export const FavoriteApi = {
  getMyFavorites: async () => {
    console.debug('[FavoriteApi] getMyFavorites -> calling /api/favorites');
    const res = await axiosJWT.get('/api/favorites');
    console.debug('[FavoriteApi] getMyFavorites -> status', res.status);
    return res.data;
  },
  addFavorite: async (roomId) => {
    console.debug('[FavoriteApi] addFavorite ->', roomId);
    const res = await axiosJWT.post(`/api/favorites/${roomId}`);
    console.debug('[FavoriteApi] addFavorite -> status', res.status);
    return res.data;
  },
  removeFavorite: async (roomId) => {
    console.debug('[FavoriteApi] removeFavorite ->', roomId);
    const res = await axiosJWT.delete(`/api/favorites/${roomId}`);
    console.debug('[FavoriteApi] removeFavorite -> status', res.status);
    return res.data;
  },
  countMyFavorites: async () => {
    console.debug('[FavoriteApi] countMyFavorites -> calling /api/favorites/count/me');
    const res = await axiosJWT.get('/api/favorites/count/me');
    console.debug('[FavoriteApi] countMyFavorites -> status', res.status);
    return res.data;
  }
};


