import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import AnimalApi, { Animal, AnimalDetails, AnimalId } from "../api/api.animals";
import { addExtensions } from "../lib";
import { Loading, makeIdle } from "../lib/loading";

export const fetchCats = createAsyncThunk("animals/cats", AnimalApi.getCats);
export const fetchDogs = createAsyncThunk("animals/dogs", AnimalApi.getDogs);
export const maybeFetchDog = createAsyncThunk("animals/dog", async () => {
  const dogs = await AnimalApi.getDogs();
  if (Math.random() < 0.5) return undefined;
  return { dog: dogs[0] };
});
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
  nonNullableAnimal: Loading<Animal>;
}

const initialState: AnimalState = {
  animalSearch: makeIdle(),
  animalDetails: {},
  animalDetailsTest: {},
  nonNullableAnimal: makeIdle(),
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
      })
      .addLoadingMatcher(maybeFetchDog, {
        nonNullableAnimal: (result) => result?.dog,
      }),
});

export default animalSlice.reducer;
