import axios from 'axios';
import type { Property, PropertyFormData } from '../types/property';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const propertyService = {
  async getAllProperties(): Promise<Property[]> {
    const response = await api.get('/properties');
    return response.data;
  },

  async getProperty(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  },

  async updateProperty(id: string, data: PropertyFormData): Promise<Property> {
    const response = await api.put(`/properties/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  }
};
