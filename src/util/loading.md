# Loading State Patterns

- Specific states
  - If you have a detail, or something retrieved by ID, don't put the loading state on the container, `Record<Id, Loading<Detail>>` is a good pattern for this
- the `is<Status>` methods are the _only_ way to access the `data` and `error` fields - use them
  - They provide a more rigid typing, reducing the risk of introducing bugs
- if you have to create a `Loading<T>` manually - use the `make<Status>` methods, to hook them into the type system properly
- Registration options
  - `extraReducers: builder => builder.addMatcher(...makeLoadingMatcher(<thunk>, <opts>))`
  - `extraReducers: builder => supportLoading(builder).addLoadingMatcher(<thunk>, <opts>))` (**Preferred**)
    - Gives _way_ better intellisense
- Options:
  - The `field` option is either:
    - A key on the `State` type
    - Or a setter (simplified):
      - `(state: State, action: { payload: Result, meta: Meta /* Contains the argument passed to the thunk */ }, status: Loading<any, any> /* What would have been set had you passed a key instead */ ) => void;`
      - Effectively putting the burden of using the data on you 😎
  - `on<Status>`
    - Called before `field` is set
    - has the _exact_ same arguments as a normal reducer
  - `after<Status>` 
    - Called after `field` is set
    - has the _exact_ same arguments as a normal reducer
  - `transform`
    - Called only on `fulfilled`
    - `(result: Result) => State[K]` where K is a key on State
      - if `testThunk` returns `Cat`, and `field` is set to `animals` on `interface State { animals: Animal[] }`:
        - `transform: (cat: Cat) => makeAnimal(cat),`

## Example Usage
```ts
// api.animal.d.ts
export type AnimalId = ..;
export type Unit = ..;

export interface Size { .. }

export interface Animal {
  id: AnimalId;
  name: string;
  age: number;
}

export interface Cat extends Animal {
  hairColor: string;
  length: Size;
}

export interface Dog extends Animal {
  height: Size;
}

export interface AnimalDetails {
  breed: string;
  weight: Size;

  ownerDetails: { .. };
}

export interface AnimalApi {
    getCats: (): Promise<Cat[]>;
    getDogs: (): Promise<Dog[]>;
    getPetDetails: (id: AnimalId): Promise<AnimalDetails>;
}
```

```ts
// animalSlice.ts
export const fetchCats    = createAsyncThunk("animals/cats",    AnimalApi.getCats);
export const fetchDogs    = createAsyncThunk("animals/dogs",    AnimalApi.getDogs);
export const petDetails   = createAsyncThunk("animals/details", AnimalApi.getPetDetails);

export interface AnimalState {
    animalSearch: Loading<Animal[]>;
    selectedAnimal?: [AnimalId, Animal];
    animalDetails: Record<AnimalId, Loading<AnimalDetail>>;
}

const initialState: AnimalState = {
    animalSearch: []
};

export const animalSlice = createSlice({
  name: "animals",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    supportLoading(builder)
        .addLoadingMatcher(fetchCats, { field: "animals", transform: makeAnimal })
        .addLoadingMatcher(fetchDogs, { field: "animals", transform: makeAnimal })
        .addLoadingMatcher(petDetails, { field: "" })
});

// export const {  } = pokemonSlice.actions;

export default pokemonSlice.reducer;

```