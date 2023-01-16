import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AnimalApi from "../api/api.animals";
import { Animal, AnimalDetails, AnimalId, Cat } from "../api/types/api.animals";
import { Loading, makeIdle, addExtensions } from "../lib/loading";

export const fetchCats = createAsyncThunk("animals/cats", AnimalApi.getCats);
export const fetchDogs = createAsyncThunk("animals/dogs", AnimalApi.getDogs);
export const petDetails = createAsyncThunk(
  "animals/details",
  AnimalApi.getPetDetails
);

export interface AnimalState {
  animalSearch: Loading<Animal[]>;
  selectedAnimal?: [AnimalId, Animal];
  animalDetails: Record<AnimalId, Loading<AnimalDetails>>;
}

const initialState: AnimalState = {
  animalSearch: makeIdle(),
  animalDetails: {},
};

export const animalSlice = createSlice({
  name: "animals",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    addExtensions(builder)
      .addLoadingMatcher(fetchCats, {
        field: "animalSearch",
        join: { dedup: "id" },
      })
      .addLoadingMatcher(fetchDogs, {
        field(state, action, status) {
          state.animalSearch = status;
        },
        join: { dedup: "id" },
      })
      .addLoadingMatcher(petDetails, {
        field: "animalDetails",
        byId: (action) => action.meta.arg,
      }),
});

export default animalSlice.reducer;
