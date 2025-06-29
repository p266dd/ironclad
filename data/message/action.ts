"use server";

import prisma from "@/lib/prisma";
import { verifyUserSession, verifyAdminSession } from "@/lib/session";

// Types
import { Prisma, Message } from "@/lib/generated/prisma";

// Error Utility
import { generatePrismaErrorMessage } from "@/prisma/error-handling";
import { revalidatePath } from "next/cache";

export async function getMessages() {
  try {
    const result = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
    return { data: result, error: null };
  } catch (error) {
    const errorMessage = await generatePrismaErrorMessage(error, "message", "findMany");
    return { data: null, error: errorMessage };
  }
}

export async function getActiveMessage() {
  verifyUserSession();

  try {
    const message = await prisma.message.findMany({
      where: { isActive: true },
    });

    return message[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addMessage({
  messageData,
}: {
  messageData: Prisma.MessageCreateInput;
}) {
  verifyAdminSession();

  try {
    const newMessage = await prisma.message.create({
      data: {
        ...messageData,
      },
    });

    return newMessage;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteMessage({ id }: { id: number }) {
  verifyAdminSession();

  try {
    const deleted = await prisma.message.delete({
      where: { id: Number(id) },
    });

    return deleted.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateMessage({
  id,
  messageData,
}: {
  id: number;
  messageData: Partial<Message>;
}) {
  verifyAdminSession();

  try {
    const updated = await prisma.message.update({
      where: { id: Number(id) },
      data: {
        ...messageData,
      },
    });

    return updated.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function makeActiveMessage({ id }: { id: number }) {
  verifyAdminSession();

  try {
    await prisma.message.updateMany({
      data: {
        isActive: false,
      },
    });

    const updated = await prisma.message.update({
      where: { id: Number(id) },
      data: {
        isActive: true,
      },
    });

    return updated.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}
