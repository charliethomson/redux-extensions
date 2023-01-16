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
    adoptPet: (id: AnimalId, application: { .. }): Promise<boolean>;
}
```

```ts
// animalSlice.ts
/* regular redux imports go here */
import { Loading, makeIdle, supportLoading } from "../util/loading";

export const fetchCats = createAsyncThunk("animals/cats", AnimalApi.getCats);
export const fetchDogs = createAsyncThunk("animals/dogs", AnimalApi.getDogs);
export const petDetails = createAsyncThunk("animals/details", AnimalApi.getPetDetails);
export const adoptPet = createAsyncThunk("animals/adopt", AnimalApi.adoptPet);

export interface AnimalState {
  wasAdoptionSuccessful: Loading<boolean>;
  animalSearch: Loading<Animal[]>;
  animalDetails: Record<AnimalId, Loading<AnimalDetails>>;
}

const initialState: AnimalState = {
  animalSearch: makeIdle(),
  animalDetails: {},
};

export const animalSlice = createSlice({
  name: "animals",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
  // `supportLoading` is needed to provide the addLoadingMatcher method to the builder
    supportLoading(builder)
      // The most simple case - we just want the data and to know what the response was:
      .addLoadingMatcher(adoptPet, { field: "wasAdoptionSuccessful" })
      // When we fetch cats, we want to add them to the `animalSearch` array
      .addLoadingMatcher(fetchCats, {
        field: "animalSearch",
        // Here we deduplicate the animalSearch array by the `id` field on `Animal`, keeping the oldest 
        join: {
          dedup: "id",
          // mapper and joiner are options, mapper is similar to transform, but has more logic regarding the status,
          // by default the join happens with spreads ([...original, ...new]), but you can pass a custom function as `joiner`
        },
      })
      .addLoadingMatcher(fetchDogs, {
        field(state, action, status) {
          state.animalSearch = status;
        },
        // You can also pass a boolean to `join`, this won't apply any deduplication
        join: true
      })
      .addLoadingMatcher(petDetails, {
        field: "animalDetails",
        // byId collects the details by a field provided by the function passed
        // `animalDetails` is a `Record<AnimalId, AnimalDetail>`, the argument pased to `petDetails` is an `AnimalId`, 
        // this gives is local loading states, each pet has it's own loading state for it's details
        byId: (action) => action.meta.arg,
      }),
});

export default animalSlice.reducer;


```