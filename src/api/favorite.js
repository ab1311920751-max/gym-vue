import request from '../utils/request'

export const addFavorite = (courseId) => request.post(`/favorite/${courseId}`)

export const removeFavorite = (courseId) => request.delete(`/favorite/${courseId}`)

export const getMyFavorites = () => request.get('/favorite/my')
