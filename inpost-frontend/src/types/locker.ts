export type Locker = {
  country: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  opening_hours: string;
  functions: string[];
  address: {
    line1: string;
    line2: string;
  };
};