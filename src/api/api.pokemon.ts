import { call, createInstance } from "./api.common";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Pokemon } from "./types/api.pokemon";

const instance = createInstance();

export const RawPokemonApi = {
  byId: (id: number) => call<Pokemon>({ instance, uri: `/pokemon/${id}` }),
};

export const PokemonApi = createApi({
  reducerPath: "pokemon",
  baseQuery: fetchBaseQuery({ baseUrl: "https://pokeapi.co/api/v2" }),
  endpoints: (builder) => ({
    byId: builder.query<Pokemon, number>({ query: (id) => `pokemon/${id}` }),
  }),
});
export const { useByIdQuery } = PokemonApi;
export default PokemonApi;
