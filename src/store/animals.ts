import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AnimalApi, { Animal, AnimalDetails, AnimalId } from "../api/api.animals";
import { addExtensions } from "../lib";
import { Loading, makeIdle } from "../lib/loading";

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
  animalDetailsTest: Record<AnimalId, string>;
  name?: Loading<string>;
}

const initialState: AnimalState = {
  animalSearch: makeIdle(),
  animalDetails: {},
  animalDetailsTest: {},
};

export const animalSlice = createSlice({
  name: "animals",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    addExtensions(builder)
      .addLoadingMatcher(fetchCats, {
        animalSearch: { join: { dedup: "id" } },
      })
      .addLoadingMatcher(fetchDogs, {
        animalSearch: true,
      })
      .addLoadingMatcher(petDetails, {
        animalDetails: {
          byId: (action) => action.meta.arg,
        },
      }),
});

export default animalSlice.reducer;
