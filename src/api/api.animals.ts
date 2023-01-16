import { call, createInstance } from "./api.common";
import { Animal, AnimalDetails, AnimalId, Cat, Dog } from "./types/api.animals";

const instance = createInstance();
const TIMEOUT = 500;

const mocks = {
  getCats: new Array(5).fill(0).map((_, id) => ({
    id: (id + 12) * id + 6,
    name: `Cat number ${id}`,
    age: (id + 12) * id + 6,
    hairColor: "orange",
    length: { amount: 14, unit: "inches" },
    imageUrl: "https://cataas.com/cat",
  })),
  getDogs: new Array(5).fill(0).map((_, id) => ({
    id: (id + 8) * id + 1,
    name: `Dog number ${id}`,
    age: (id + 8) * id + 1,
    height: { amount: 2, unit: "feet" },
    imageUrl: "https://dog.ceo/api/breeds/image/random",
  })),
  getPetDetails: {
    breed: "Breed",
    weight: { amount: 20, unit: "tons" },

    ownerDetails: {
      ownerId: 12,
      ownerName: "Jack Bauer",
      ownerContact: {
        homePhone: "5555551234",
        mobilePhone: "5558001234",
        email: "jack@fox.com",
      },
    },
  },
};

export const AnimalApi = {
  getCats: (): Promise<Cat[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mocks.getCats), TIMEOUT)
    );
  },
  getDogs: (): Promise<Dog[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mocks.getDogs), TIMEOUT)
    );
  },
  getPetDetails: (id: AnimalId): Promise<AnimalDetails> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mocks.getPetDetails), TIMEOUT)
    );
  },
};

export const identities = {
  isCat(animal?: Animal): animal is Cat {
    return animal !== undefined && "hairColor" in animal;
  },
  isDog(animal?: Animal): animal is Dog {
    return animal !== undefined && "height" in animal;
  },
};

export default AnimalApi;
