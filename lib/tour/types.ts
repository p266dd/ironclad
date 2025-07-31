export interface TourContextType {
  currentStep: number;
  currentTour: string | null;
  setCurrentStep: (step: number, delay?: number) => void;
  closeTour: () => void;
  startTour: (tourName: string) => void;
  isTourVisible: boolean;
}

export interface Step {
  icon: React.ReactNode | null;
  title: string;
  content: React.ReactNode;
  selector: string;
  side?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "left-top"
    | "left-bottom"
    | "right-top"
    | "right-bottom";
  showControls?: boolean;
  pointerPadding?: number;
  pointerRadius?: number;
  nextRoute?: string;
  prevRoute?: string;
}

export interface Tour {
  tour: string;
  steps: Step[];
}

export interface TourProps {
  children: React.ReactNode;
  interact?: boolean;
  tours: Tour[];
  showTour?: boolean;
  shadowRgb?: string;
  shadowOpacity?: string;
  cardComponent?: React.ComponentType<CardComponentProps>;
}

export interface CardComponentProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  arrow: React.ReactElement;
}
