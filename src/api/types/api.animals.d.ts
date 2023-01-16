export type AnimalId = number;
export type Unit = string;

export interface Size {
  amount: number;
  unit: Unit;
}

export interface Animal {
  id: AnimalId;
  name: string;
  age: number;
  imageUrl: string;
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

  ownerDetails: {
    ownerId: OwnerId;
    ownerName: string;
    ownerContact: {
      homePhone: string;
      mobilePhone: string;
      email: string;
    };
  };
}
