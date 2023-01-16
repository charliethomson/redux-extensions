import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import { Pokemon } from "../api/types/api.pokemon";
import PokemonApi, { RawPokemonApi } from "../api/api.pokemon";
import {
  Loading,
  makeFulfilled,
  makeLoadingMatcher,
  makePending,
  supportLoading,
} from "../util/loading";

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
  selectedPokemon?: Loading<Pokemon>;
}

const initialState: PokemonState = {
  cache: {},
};

export const pokemonSlice = createSlice({
  name: "pokemon",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    supportLoading(builder)
      .addLoadingMatcher(fetchPokemon, {
        field: "selectedPokemon",
      })
      .addLoadingMatcher(fetchPokemonWithCaching, {
        field: "selectedPokemon",
        afterFulfilled(state, { payload, meta }) {
          state.cache[meta.arg] = payload;
        },
      }),
});

// export const {  } = pokemonSlice.actions;

export default pokemonSlice.reducer;
