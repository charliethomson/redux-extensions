import React from "react";
import ReactDOM from "react-dom";
import { AnimalList, PokemonList } from "./App";
import { store } from "./store";
import { Provider } from "react-redux";

ReactDOM.render(
  <Provider store={store}>
    <AnimalList />
    <PokemonList />
  </Provider>,
  document.getElementById("root")
);
