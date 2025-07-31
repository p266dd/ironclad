"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import type { CardComponentProps } from "./types";

export const CustomCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {step.icon} {step.title}
          </CardTitle>
          <CardDescription>
            <h2>
              {currentStep} of {totalSteps}
            </h2>
          </CardDescription>
        </CardHeader>

        <CardContent>{step.content}</CardContent>
        <CardFooter>
          <button onClick={prevStep}>Previous</button>
          <button onClick={nextStep}>Next</button>
        </CardFooter>
      </Card>
      {arrow}
    </>
  );
};
