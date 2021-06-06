export type Id = string;
export interface Identifiable {
  id: Id;
}

export interface Entity extends Identifiable {}
