import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Hobby } from '../types';

type HobbiesState = {
  items: Hobby[];
  query: string;
};

const initialState: HobbiesState = {
  items: [
    { id: 'h1', name: 'Cycling' },
    { id: 'h2', name: 'Gaming' },
    { id: 'h3', name: 'Cooking' },
    { id: 'h4', name: 'Reading' },
    { id: 'h5', name: 'Music' }
  ],
  query: ''
};

const hobbiesSlice = createSlice({
  name: 'hobbies',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => { state.query = action.payload; },
    setHobbies: (state, action: PayloadAction<Hobby[]>) => { state.items = action.payload; }
  }
});

export const { setQuery, setHobbies } = hobbiesSlice.actions;
export default hobbiesSlice.reducer;
