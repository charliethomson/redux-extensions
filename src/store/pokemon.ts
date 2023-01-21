import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import PokemonApi, { Pokemon, RawPokemonApi } from "../api/api.pokemon";
import {
  Loading,
  makeFulfilled,
  makeLoadingMatcher,
  makePending,
} from "../lib/loading";
import { addExtensions } from "../lib";

export const fetchPokemon = createAsyncThunk(
  "pokemon/fetch",
  RawPokemonApi.byId
);
export const fetchPokemonWithCaching = createAsyncThunk(
  "pokemon/fetchWithCaching",
  (id: number, { getState }) => {
    const state: any /*RootState*/ = getState();
    if (state.pokemon.cache[id] !== undefined) {
      return state.pokemon.cache[id];
    }

    return RawPokemonApi.byId(id);
  }
);

export interface PokemonState {
  cache: Record<number, Loading<Pokemon>>;
  selectedPokemon?: Pokemon;
  selectedPokemonName?: string;
}

const initialState: PokemonState = {
  cache: {},
};

export const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    addExtensions(builder).addThunkMatcher(fetchPokemon, {
      selectedPokemonName: (result) => result.name,
      selectedPokemon: true,
    }),
});

// export const {  } = pokemonSlice.actions;

export default pokemonSlice.reducer;
