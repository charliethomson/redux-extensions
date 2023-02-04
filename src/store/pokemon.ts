import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Pokemon, RawPokemonApi } from "../api/api.pokemon";
import { Loading } from "../lib/loading";
import { addExtensions } from "../lib";

export const fetchPokemon = createAsyncThunk(
  "pokemon/fetch",
  RawPokemonApi.byId
);

export interface PokemonState {
  cache: Record<number, Loading<Pokemon>>;
  selectedPokemon?: Pokemon;
  selectedPokemonName?: string;
  something?: boolean;
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
      something: {
        onPending: () => true,
      },
    }),
});

// export const {  } = pokemonSlice.actions;

export default pokemonSlice.reducer;
