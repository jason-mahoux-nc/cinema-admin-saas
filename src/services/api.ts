
import {
  Booking,
  CreateBookingApiDto,
  CreateMovieSessionApiDto,
  CreateRoomApiDto,
  CreateScreenApiDto,
  CreateSeatApiDto,
  CreateTheaterApiDto,
  MovieSession,
  Room,
  Screen,
  Seat,
  Theatre,
  UpdateBookingApiDto,
  UpdateMovieSessionApiDto,
  UpdateRoomApiDto,
  UpdateScreenApiDto,
  UpdateSeatApiDto,
  UpdateTheaterApiDto,
} from '@/types/cinema.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Helper function for making API requests
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json() as Promise<T>;
}

// Theaters API
export const theatersApi = {
  getAll: () => fetchApi<Theatre[]>('/theaters'),
  getById: (id: string) => fetchApi<Theatre>(`/theaters/${id}`),
  create: (data: CreateTheaterApiDto) => 
    fetchApi<Theatre>('/theaters', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateTheaterApiDto) => 
    fetchApi<Theatre>(`/theaters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/theaters/${id}`, { method: 'DELETE' }),
};

// Rooms API
export const roomsApi = {
  getAll: () => fetchApi<Room[]>('/rooms'),
  getById: (id: string) => fetchApi<Room>(`/rooms/${id}`),
  create: (data: CreateRoomApiDto) => 
    fetchApi<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateRoomApiDto) => 
    fetchApi<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/rooms/${id}`, { method: 'DELETE' }),
};

// Screens API
export const screensApi = {
  getAll: () => fetchApi<Screen[]>('/screens'),
  getById: (id: string) => fetchApi<Screen>(`/screens/${id}`),
  create: (data: CreateScreenApiDto) => 
    fetchApi<Screen>('/screens', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateScreenApiDto) => 
    fetchApi<Screen>(`/screens/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/screens/${id}`, { method: 'DELETE' }),
};

// Seats API
export const seatsApi = {
  getAll: () => fetchApi<Seat[]>('/seats'),
  getById: (id: string) => fetchApi<Seat>(`/seats/${id}`),
  create: (data: CreateSeatApiDto) => 
    fetchApi<Seat>('/seats', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateSeatApiDto) => 
    fetchApi<Seat>(`/seats/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/seats/${id}`, { method: 'DELETE' }),
};

// Movie Sessions API
export const movieSessionsApi = {
  getAll: () => fetchApi<MovieSession[]>('/movie-sessions'),
  getById: (id: string) => fetchApi<MovieSession>(`/movie-sessions/${id}`),
  create: (data: CreateMovieSessionApiDto) => 
    fetchApi<MovieSession>('/movie-sessions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateMovieSessionApiDto) => 
    fetchApi<MovieSession>(`/movie-sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/movie-sessions/${id}`, { method: 'DELETE' }),
};

// Bookings API
export const bookingsApi = {
  getAll: () => fetchApi<Booking[]>('/bookings'),
  getById: (id: string) => fetchApi<Booking>(`/bookings/${id}`),
  create: (data: CreateBookingApiDto) => 
    fetchApi<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: UpdateBookingApiDto) => 
    fetchApi<Booking>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchApi<void>(`/bookings/${id}`, { method: 'DELETE' }),
};
