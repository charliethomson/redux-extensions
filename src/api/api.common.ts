import { Axios } from "axios";

export const createInstance = (): Axios =>
  new Axios({
    baseURL: "https://pokeapi.co/api/v2",
  });

export interface CallOpts<T = unknown, R = T> {
  uri: string;
  instance: Axios;
  transform?: (response: T) => R;
}
export const call = async <T = unknown, R = T>(
  opts: CallOpts<T, R>
): Promise<R> => {
  const response = await opts.instance.get(opts.uri);
  if (response.status !== 200) throw response.statusText;
  const data = JSON.parse(response.data) as T;
  const result = opts.transform ? opts.transform(data) : (data as unknown as R);

  return result;
};
