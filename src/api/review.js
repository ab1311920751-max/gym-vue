import request from '../utils/request'

export const addReview = (courseId, data) => request.post(`/course/${courseId}/review`, data)

export const getReviews = (courseId) => request.get(`/course/${courseId}/reviews`)
