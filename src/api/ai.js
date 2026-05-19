import request from '../utils/request'

export const chat = (data) => request.post('/ai/chat', data)

export const getMySessions = () => request.get('/ai/session/my')

export const getMessages = (sessionId) => request.get(`/ai/session/${sessionId}/messages`)

export const deleteSession = (sessionId) => request.delete(`/ai/session/${sessionId}`)

export const listKnowledge = () => request.get('/ai/knowledge/list')

export const addKnowledge = (data) => request.post('/ai/knowledge', data)

export const updateKnowledge = (id, data) => request.put(`/ai/knowledge/${id}`, data)

export const deleteKnowledge = (id) => request.delete(`/ai/knowledge/${id}`)
