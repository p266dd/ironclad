"use server";

import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Generates a user-friendly error message from a Prisma error and logs technical details.
 * @param error The error object.
 * @param modelName The name of the Prisma model.
 * @param operation The name of the operation being performed (e.g., 'create', 'findUnique').
 * @returns A user-friendly error message string.
 */
export async function generatePrismaErrorMessage(
  error: unknown,
  modelName: string,
  operation: string
): Promise<string> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let userMessage: string;
    switch (error.code) {
      case "P2000":
        userMessage = `The value provided for a field on ${modelName} is too long.`;
        break;
      case "P2001":
        userMessage = `The ${modelName} record you tried to ${operation} could not be found.`;
        break;
      case "P2002":
        const target = error.meta?.target as string[] | string | undefined;
        const fields = Array.isArray(target) ? target.join(", ") : target;
        userMessage = `A ${modelName} record with this value already exists for field(s): ${
          fields || "unique constraint"
        }.`;
        break;
      case "P2003":
        userMessage = `Operation on ${modelName} failed because a related record ('${
          error.meta?.field_name || "related field"
        }') does not exist.`;
        break;
      case "P2011":
        userMessage = `A required field on ${modelName} was left null. Constraint: ${
          error.meta?.constraint || "unknown"
        }.`;
        break;
      case "P2014":
        userMessage = `The ${operation} on ${modelName} would violate a required relationship with another record.`;
        break;
      case "P2025":
        userMessage =
          `The ${operation} on ${modelName} failed because a required record was not found. ${
            error.meta?.cause || ""
          }`.trim();
        break;
      default:
        userMessage = `A database error occurred while trying to ${operation} ${modelName}. (Code: ${error.code})`;
    }
    // Log for debugging
    console.error(
      `[PrismaKnownError] Code: ${
        error.code
      }, Model: ${modelName}, Operation: ${operation}, Message: ${
        error.message
      }, Meta: ${JSON.stringify(error.meta)}`
    );
    return userMessage;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Log for debugging
    console.error(
      `[PrismaValidationError] Model: ${modelName}, Operation: ${operation}, Message: ${error.message}`
    );
    return `Invalid data provided for ${modelName}. Please check your input.`;
  } else if (error instanceof Error) {
    // Log for debugging
    console.error(
      `[GenericError] Model: ${modelName}, Operation: ${operation}, Message: ${error.message}, Stack: ${error.stack}`
    );
    return `An unexpected error occurred while processing your request for ${modelName}.`;
  } else {
    // Log for debugging
    console.error(
      `[UnknownError] Model: ${modelName}, Operation: ${operation}, Error: ${JSON.stringify(
        error
      )}`
    );
    return `An unknown error occurred while processing your request for ${modelName}.`;
  }
}
