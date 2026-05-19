import request from '../utils/request'

export const listCoaches = () => request.get('/coach/list')

export const getCoach = (id) => request.get(`/coach/${id}`)

export const addCoach = (data) => request.post('/coach', data)

export const updateCoach = (id, data) => request.put(`/coach/${id}`, data)

export const deleteCoach = (id) => request.delete(`/coach/${id}`)
