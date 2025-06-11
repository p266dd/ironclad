"use server";

import type { PrismaClient } from "@/lib/generated/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";

type Model = keyof Omit<
  PrismaClient,
  // Exclude internal methods/properties.
  | "$connect"
  | "$disconnect"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$on"
  | "$queryRaw"
  | "$queryRawUnsafe"
  | "$transaction"
  | "$use"
  | "$extends"
>;

type DataAccessResult<T> = { data: T; error: null } | { data: null; error: string };

/**
 * Generates a user-friendly error message from a Prisma error and logs technical details.
 * @param error The error object.
 * @param modelName The name of the Prisma model.
 * @param operation The name of the operation being performed (e.g., 'create', 'findUnique').
 * @returns A user-friendly error message string.
 */
function generatePrismaErrorMessage(
  error: unknown,
  modelName: string,
  operation: string
): string {
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
    // console.error(
    //   `[PrismaKnownError] Code: ${
    //     error.code
    //   }, Model: ${modelName}, Operation: ${operation}, Message: ${
    //     error.message
    //   }, Meta: ${JSON.stringify(error.meta)}`
    // );
    return userMessage;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(
      `[PrismaValidationError] Model: ${modelName}, Operation: ${operation}, Message: ${error.message}`
    );
    return `Invalid data provided for ${modelName}. Please check your input.`;
  } else if (error instanceof Error) {
    console.error(
      `[GenericError] Model: ${modelName}, Operation: ${operation}, Message: ${error.message}, Stack: ${error.stack}`
    );
    return `An unexpected error occurred while processing your request for ${modelName}.`;
  } else {
    console.error(
      `[UnknownError] Model: ${modelName}, Operation: ${operation}, Error: ${JSON.stringify(
        error
      )}`
    );
    return `An unknown error occurred while processing your request for ${modelName}.`;
  }
}

/**
 * Creates a new record for the specified model.
 * @param model The name of the Prisma model (e.g., 'user', 'staff').
 * @param payload The data to create the record with.
 * @param options Optional arguments for the create operation (e.g., select, include).
 * @returns An object containing the created record or an error message.
 */
export async function create<T = unknown>(
  model: Model,
  payload: object,
  options?: object
): Promise<DataAccessResult<T>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.create({
      data: payload,
      ...options,
    });
    return { data: result as T, error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, String(model), "create");
    return { data: null, error: errorMessage };
  }
}

/**
 * Finds a unique record by its ID or other unique criteria.
 * @param model The name of the Prisma model.
 * @param args Arguments for the findUnique operation (must include 'where'; e.g., select, include).
 * @returns An object containing the found record (or null if not found) or an error message.
 */
export async function findUnique<T = unknown>(
  model: Model,
  args: { where: object; select?: object; include?: object } // Ensure 'where' is present
): Promise<DataAccessResult<T | null>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const record = await delegate.findUnique(args);
    return { data: record as T | null, error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, String(model), "findUnique");
    return { data: null, error: errorMessage };
  }
}

/**
 * Finds multiple records based on the provided criteria.
 * @param model The name of the Prisma model.
 * @param args Optional arguments for the findMany operation (e.g., where, orderBy, select, include, skip, take).
 * @returns An object containing an array of found records or an error message.
 */
export async function findMany<T = unknown>(
  model: Model,
  args?: object
): Promise<DataAccessResult<T[]>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const records = await delegate.findMany(args);
    return { data: records as T[], error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, String(model), "findMany");
    return { data: null, error: errorMessage };
  }
}

/**
 * Updates records matching the criteria.
 * @param model The name of the Prisma model.
 * @param payload The data to update the record(s) with.
 * @param args Arguments for the update operation (must include 'where'; e.g., data, select, include).
 * @returns An object containing the updated record or an error message.
 */
export async function update<T = unknown>(
  model: Model,
  args: { data: object; where: object; select?: object; include?: object } // Ensure 'data' and 'where'
): Promise<DataAccessResult<T>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.update(args);
    return { data: result as T, error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, String(model), "update");
    return { data: null, error: errorMessage };
  }
}

/**
 * Deletes records matching the criteria.
 * @param model The name of the Prisma model.
 * @param args Arguments for the delete operation (must include 'where'; e.g., select).
 * @returns An object containing the deleted record or an error message.
 */
export async function remove<T = unknown>(
  model: Model,
  args: { where: object; select?: object } // Ensure 'where' is present
): Promise<DataAccessResult<T>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = prisma[model] as any;
    const result = await delegate.delete(args);
    return { data: result as T, error: null };
  } catch (error) {
    const errorMessage = generatePrismaErrorMessage(error, String(model), "remove");
    return { data: null, error: errorMessage };
  }
}
