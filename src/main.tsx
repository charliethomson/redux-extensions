import React from "react";
import ReactDOM from "react-dom";
import { PokemonList } from "./App";
import { store } from "./store";
import { Provider } from "react-redux";

ReactDOM.render(
  <Provider store={store}>
    <PokemonList />
  </Provider>,
  document.getElementById("root")
);
