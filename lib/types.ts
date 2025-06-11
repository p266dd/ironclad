export interface ActionFormInitialState {
  success: boolean;
  message?: string | undefined;
  fieldErrors?: Record<string, string> | undefined;
}
