import { configureStore } from "@reduxjs/toolkit";
import { useDispatch as useReduxDispatch } from "react-redux";
import pokemonReducer from "./pokemon";
import animalReducer from "./animals";

export const store = configureStore({
  reducer: {
    pokemon: pokemonReducer,
    animals: animalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch: () => AppDispatch = useReduxDispatch;
