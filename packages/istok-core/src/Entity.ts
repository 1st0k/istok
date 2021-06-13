import { ResultSuccess, success } from './Result';

export type Id = string;
export interface Identifiable {
  id: Id;
}

export type Entity<T> = Identifiable & { entity: T };

export type EntityRespone<T> = ResultSuccess<Entity<T>>;

export function entityResponse<T>(id: Id, entity: T) {
  return success({ id, entity });
}
