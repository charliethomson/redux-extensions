import React, { FC, useState } from "react";
import { RootState, useDispatch } from "./store";
import { useSelector } from "react-redux";
import { isFulfilled } from "./util/loading";
import { useByIdQuery } from "./api/api.pokemon";
import { LoadingSwitch } from "./util/LoadingComponents";
import { fetchPokemon, fetchPokemonWithCaching } from "./store/pokemon";
import { fetchCats, fetchDogs, petDetails } from "./store/animals";
import { identities } from "./api/api.animals";
import { AnimalId } from "./api/types/api.animals";

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
export const PokemonList = () => {
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
