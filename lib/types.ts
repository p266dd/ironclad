export interface ActionFormInitialState {
  success: boolean;
  message?: string | undefined;
  fieldErrors?: Record<string, string> | undefined;
}

export type TActiveFilters = {
  tag: string | null;
  search: TSearchFields | null;
};

export type TSearchFields = {
  searchTerm?: string;
  style?: string;
  stock?: string;
  price: string;
  size: string;
  brand: string | string[];
  material: string | string[];
};
