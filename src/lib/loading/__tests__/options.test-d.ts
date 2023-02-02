/* eslint-disable @typescript-eslint/ban-ts-comment */
import { __ } from "lodash";
import { Loading } from "../core";
import { FieldOpt, FieldSettings, MakeLoadingMatcherOpts } from "../options";

type Expect<A extends E, E = 1> = A;

type ObjectDetails = {
  name: string;
  age: string;
};

type MockObject = {
  idField: string;
  optionalIdField?: string;
};

type MockObjectSubDetails = {
  idField: string;
  optionalIdField?: string;
  details: Loading<ObjectDetails>;
};

type MockState = {
  neverTypedField: never;
  nonLoading: string;
  optionalNonLoading?: string;

  optionalUntypedLoading?: Loading<unknown>;
  optionalTypedLoading?: Loading<string>;
  optionalObjectLoading?: Loading<MockObject>;
  optionalObjectLoadingWithSubDetails?: Loading<MockObject>;
  objectFieldWithSubDetails: Loading<MockObjectSubDetails>;
  objectArrayFieldNoDetails: Loading<MockObject[]>;

  objectDetailsRelationField?: Record<string, Loading<ObjectDetails>>;
  objectDetailsArrayRelationField?: Record<string, Loading<ObjectDetails[]>>;
};

type Meta = { arg: string };

type _StringOpts = MakeLoadingMatcherOpts<MockState, string, Meta>;
//#region StringOpts
//#region nonloading
type _StringOpts_NeverTypedField = _StringOpts["neverTypedField"];
type _StringOpts_NonLoading = _StringOpts["nonLoading"];
type _StringOpts_OptionalNonLoading = _StringOpts["optionalNonLoading"];
type _StringOpts_NeverTypedField_ShouldBeUndefined = Expect<
  undefined,
  _StringOpts_NeverTypedField
>;
type _StringOpts_NonLoading_ShouldBeUndefined = Expect<
  undefined,
  _StringOpts_NonLoading
>;
type _StringOpts_OptionalNonLoading_ShouldBeUndefined = Expect<
  undefined,
  _StringOpts_OptionalNonLoading
>;
//#endregion nonloading
//#region relation
type _StringOpts_ObjectDetailsRelationField =
  // ^?
  _StringOpts["objectDetailsRelationField"];
type _StringOpts_ObjectDetailsRelationField_ShouldBeFieldSettings = Expect<
  _StringOpts_ObjectDetailsRelationField,
  | FieldSettings<MockState, string, Meta, "objectDetailsRelationField">
  | undefined
>;
type _StringOpts_ObjectDetailsRelationField_ShouldNotBeUndefined = Expect<
  // @ts-expect-error
  _StringOpts_ObjectDetailsRelationField,
  undefined
>;

type _StringOpts_ObjectDetailsArrayRelationField =
  // ^?
  _StringOpts["objectDetailsArrayRelationField"];
type _StringOpts_ObjectDetailsArrayRelationField_ShouldBeFieldSettings = Expect<
  _StringOpts_ObjectDetailsArrayRelationField,
  | FieldSettings<MockState, string, Meta, "objectDetailsArrayRelationField">
  | undefined
>;
type _StringOpts_ObjectDetailsArrayRelationField_ShouldNotBeUndefined = Expect<
  // @ts-expect-error
  _StringOpts_ObjectDetailsArrayRelationField,
  undefined
>;

//#endregion relation
//#region loading
type _StringOpts_OptionalUntypedLoading = _StringOpts["optionalUntypedLoading"];
type _StringOpts_OptionalUntypedLoading_ShouldBeFieldOpt = Expect<
  _StringOpts_OptionalUntypedLoading,
  FieldOpt<MockState, string, Meta, "optionalUntypedLoading"> | undefined
>;
type _StringOpts_OptionalUntypedLoading_ShouldNotBeUndefined = Expect<
  //@ts-expect-error
  _StringOpts_OptionalUntypedLoading,
  undefined
>;
type _StringOpts_OptionalTypedLoading = _StringOpts["optionalTypedLoading"];
type _StringOpts_OptionalTypedLoading_ShouldBeFieldOpt = Expect<
  _StringOpts_OptionalTypedLoading,
  FieldOpt<MockState, string, Meta, "optionalTypedLoading"> | undefined
>;
type _StringOpts_OptionalTypedLoading_ShouldNotBeUndefined = Expect<
  //@ts-expect-error
  _StringOpts_OptionalTypedLoading,
  undefined
>;
type _StringOpts_OptionalObjectLoading = _StringOpts["optionalObjectLoading"];
type _StringOpts_OptionalObjectLoading_ShouldBeFieldOpt = Expect<
  _StringOpts_OptionalObjectLoading,
  FieldOpt<MockState, string, Meta, "optionalObjectLoading"> | undefined
>;
type _StringOpts_OptionalObjectLoading_ShouldNotBeUndefined = Expect<
  //@ts-expect-error
  _StringOpts_OptionalObjectLoading,
  undefined
>;
type _StringOpts_OptionalObjectLoadingWithSubDetails =
  _StringOpts["optionalObjectLoadingWithSubDetails"];
type _StringOpts_OptionalObjectLoadingWithSubDetails_ShouldBeFieldOpt = Expect<
  _StringOpts_OptionalObjectLoadingWithSubDetails,
  | FieldOpt<MockState, string, Meta, "optionalObjectLoadingWithSubDetails">
  | undefined
>;
type _StringOpts_OptionalObjectLoadingWithSubDetails_ShouldNotBeUndefined =
  //@ts-expect-error
  Expect<_StringOpts_OptionalObjectLoadingWithSubDetails, undefined>;
type _StringOpts_ObjectFieldWithSubDetails =
  _StringOpts["objectFieldWithSubDetails"];
type _StringOpts_ObjectFieldWithSubDetails_ShouldBeFieldOpt = Expect<
  _StringOpts_ObjectFieldWithSubDetails,
  FieldOpt<MockState, string, Meta, "objectFieldWithSubDetails"> | undefined
>;
type _StringOpts_ObjectFieldWithSubDetails_ShouldBeLoading = Expect<
  Loading<never>,
  MockState["objectFieldWithSubDetails"]
>;
type _StringOpts_ObjectFieldWithSubDetails_ShouldNotBeUndefined = Expect<
  //@ts-expect-error
  _StringOpts_ObjectFieldWithSubDetails,
  undefined
>;
type _StringOpts_ObjectArrayFieldNoDetails =
  _StringOpts["objectArrayFieldNoDetails"];
type _StringOpts_ObjectArrayFieldNoDetails_ShouldBeFieldOpt = Expect<
  _StringOpts_ObjectArrayFieldNoDetails,
  FieldOpt<MockState, string, Meta, "objectArrayFieldNoDetails"> | undefined
>;
type _StringOpts_ObjectArrayFieldNoDetails_ShouldNotBeUndefined = Expect<
  //@ts-expect-error
  _StringOpts_ObjectArrayFieldNoDetails,
  undefined
>;
//#endregion loading
//#endregion
export {};
