"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GetPredictionOutput } from "@/ai/flows/get-prediction";

interface PredictionCardsProps {
  predictionData: GetPredictionOutput;
}

const toTitleCase = (str: string) => {
  return str.replace(/_/g, ' ').replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Helper function to render text with line breaks
const renderValueWithBreaks = (value: string) => {
  // Replace double asterisks for section breaks and single for paragraph breaks
  const formattedValue = value
    .replace(/\*\*/g, "\n\n")
    .replace(/\*/g, "\n");

  return formattedValue.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));
};

export function PredictionCards({ predictionData }: PredictionCardsProps) {
  if (!predictionData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(predictionData).map(([key, value]) => {
        if (!value) return null;
        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{toTitleCase(key)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{renderValueWithBreaks(value)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
