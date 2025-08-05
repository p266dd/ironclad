"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CardComponentProps } from "./types";

import { useTour } from "./tour-context";

export const CustomCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) => {
  const { closeTour } = useTour();

  return (
    <>
      <Card className="p-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pt-2 px-0">
          <CardTitle className="leading-relaxed">
            {step.icon} {step.title}
          </CardTitle>

          {totalSteps > 1 && (
            <CardDescription className="absolute top-3 right-3 px-0">
              <h2>
                {currentStep + 1} of {totalSteps}
              </h2>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="min-w-[250px] px-0">{step.content}</CardContent>
        <CardFooter className="flex flex-col items-end gap-2 px-0">
          {totalSteps > 1 && (
            <div className="w-full flex items-center gap-3 self-start">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevStep();
                  }}
                >
                  Previous
                </Button>
              )}

              {currentStep < totalSteps - 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextStep();
                  }}
                >
                  Next
                </Button>
              )}
            </div>
          )}
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              closeTour();
            }}
          >
            Close
          </Button>
        </CardFooter>
      </Card>
      {arrow}
    </>
  );
};
