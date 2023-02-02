import React, { FC } from "react";
import { RootState, useDispatch } from "./store";
import { useSelector } from "react-redux";
import { Type } from "./api/api.pokemon";
import { fetchPokemon } from "./store/pokemon";
import { fetchCats, fetchDogs, petDetails } from "./store/animals";
import { AnimalId, identities } from "./api/api.animals";
import { LoadingSwitch } from "./lib/loading";

const Details: FC<{ id: AnimalId }> = ({ id }) => {
  const { detail } = useSelector((state: RootState) => ({
    detail: state.animals.animalDetails[id],
  }));

  return (
    <LoadingSwitch
      loader={detail}
      fulfilled={(data) => (
        <span>{`Owner: ${data.ownerDetails.ownerName}`}</span>
      )}
      rejected={(error) => <span style={{ color: "red" }}>Error! {error}</span>}
      pending={<span>Loading...</span>}
    />
  );
};
export const AnimalList = () => {
  const dispatch = useDispatch();
  const { animals } = useSelector((state: RootState) => ({
    animals: state.animals.animalSearch,
  }));

  return (
    <div>
      <button onClick={() => dispatch(fetchCats())}>Search for cats</button>
      <button onClick={() => dispatch(fetchDogs())}>Search for dogs</button>
      <LoadingSwitch
        loader={animals}
        fulfilled={(data) => (
          <div>
            <p>{data.length} Animals found!</p>
            {data.map((animal) => (
              <div
                key={animal.id}
                style={{ cursor: "pointer" }}
                onClick={() => dispatch(petDetails(animal.id))}
              >
                <p>{animal.name}</p>
                <p>
                  {identities.isCat(animal) ? "Cat" : "Dog"} - {animal.age} y/o
                </p>
                <Details id={animal.id} />
              </div>
            ))}
          </div>
        )}
        pending={<span>Loading...</span>}
        rejected={(error) => (
          <span style={{ color: "red" }}>Error! {error}</span>
        )}
      />
    </div>
  );
};

export const PokemonList = () => {
  const dispatch = useDispatch();
  const { selectedPokemon, selectedPokemonName } = useSelector(
    (state: RootState) => state.pokemon
  );

  return (
    <div>
      <button
        onClick={() =>
          dispatch(fetchPokemon(Math.floor(Math.random() * 10) + 1))
        }
      >
        fetch a pokemon!
      </button>
      {selectedPokemon ? (
        <div>
          <p>
            {selectedPokemonName} - {selectedPokemon.id}
          </p>
          <p>
            {selectedPokemon.types.map((ty: Type) => (
              <span
                key={ty.slot}
                color="darkgray"
                style={{ paddingRight: "0.5rem" }}
              >
                {ty.type.name}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <span>None selected!</span>
      )}
    </div>
  );
};
