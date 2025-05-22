
export interface Theatre {
  id: string;
  name: string;
  inseeCode: string;
  website: string;
  wheelchair: boolean;
  threeD: boolean;
  pictureUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTheaterApiDto {
  id?: string;
  name: string;
  inseeCode: string;
  website: string;
  wheelchair: boolean;
  threeD: boolean;
  pictureUrl?: string;
}

export interface UpdateTheaterApiDto extends CreateTheaterApiDto {
  id: string;
}

export interface Room {
  id: string;
  name: string;
  sizeX: number;
  sizeY: number;
  screenId: string;
  theaterId: string;
  updatedAt?: string;
  seats?: Seat[];
}

export interface CreateRoomApiDto {
  name: string;
  sizeX: number;
  sizeY: number;
  screenId: string;
  theaterId: string;
}

export interface UpdateRoomApiDto extends CreateRoomApiDto {
  id: string;
}

export interface Screen {
  id: string;
  sizeX: number;
  sizeY: number;
  updatedAt?: string;
}

export interface CreateScreenApiDto {
  sizeX: number;
  sizeY: number;
}

export interface UpdateScreenApiDto extends CreateScreenApiDto {
  id: string;
}

export interface Seat {
  id: string;
  roomId: string;
  name: string;
  positionX: number;
  positionY: number;
  available: boolean;
  updatedAt?: string;
}

export interface CreateSeatApiDto {
  name: string;
  positionX: number;
  positionY: number;
  isAvailable: boolean;
  roomId: string;
}

export interface UpdateSeatApiDto extends Omit<CreateSeatApiDto, 'isAvailable'> {
  id: string;
  isAvailable: boolean;
}

export interface MovieSession {
  id: string;
  externalUrl: string;
  movieId: string;
  dateTime: string;
  roomId: string;
  typeId: string;
  updatedAt?: string;
  bookable: boolean;
}

export interface CreateMovieSessionApiDto {
  isBookable: boolean;
  externalUrl: string;
  movieId: string;
  dateTime: string;
  roomId: string;
  typeId: string;
}

export interface UpdateMovieSessionApiDto extends CreateMovieSessionApiDto {
  id: string;
}

export interface Booking {
  id: string;
  screeningId: string;
  seatId: string;
  userId: string;
  status: string;
  updatedAt?: string;
}

export interface CreateBookingApiDto {
  screeningId: string;
  seatId: string;
}

export interface UpdateBookingApiDto extends CreateBookingApiDto {
  id: string;
}
