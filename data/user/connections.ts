"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifyUserSession } from "@/lib/session";

import { Prisma } from "@/lib/generated/prisma";

export async function updateOwnUserConnection(data: boolean) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (!userId === null) {
    return { error: "Invalid user." };
  }

  try {
    // Validate Data
    const validateData = Boolean(data);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        canConnect: data,
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/account");

    return { error: null, data: updatedUser };
  } catch (error) {
    console.error(error);
    return { error: "We were unable to update your information." };
  }
}

export async function verifyCanConnect(businessCode: string) {
  const session = await verifyUserSession();
  const userId = session.id;

  if (!userId === null) {
    return { error: "Invalid user." };
  }

  if (!businessCode) {
    return {
      error: "Business number not provided.",
    };
  }

  try {
    const ownUser = await prisma.user.findFirst({
      where: {
        businessCode: {
          equals: businessCode,
          mode: "insensitive",
        },
      },
      select: {
        businessCode: true,
        id: true,
      },
    });

    // Return error if user is trying to connect to teir own code.
    if (ownUser?.id === userId) {
      return { error: "Cannot connect to your own business." };
    }

    const business = await prisma.user.findMany({
      where: {
        businessCode: {
          equals: businessCode,
          mode: "insensitive",
        },
      },
      select: {
        canConnect: true,
        businessCode: true,
        businessName: true,
        id: true,
      },
    });

    if (business[0].canConnect === false) {
      return {
        error: "This business does not accept connections.",
      };
    }

    return {
      error: null,
      data: {
        ...business[0],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      error: "We were unable to find the business using this code.",
    };
  }
}

export async function handleNewConnection(connectionObj: {
  receiveId: string;
  requestId: string;
  businessName: string;
  businessCode: string;
  name: string;
  email: string;
}) {
  const session = await verifyUserSession();
  const ownUserId = session.id;

  if (!ownUserId === null) {
    return { error: "Invalid user." };
  }

  if (
    !connectionObj ||
    !connectionObj?.businessCode ||
    !connectionObj?.receiveId ||
    !connectionObj?.requestId
  ) {
    return {
      error: "Connection data is missing",
    };
  }

  // Code guide
  // code 1 is receiving connection
  // code 2 is submitting connection

  try {
    // Retrieve pending requested connections
    const pendingRequestConnections = (
      await prisma.user.findUnique({
        where: {
          id: connectionObj.requestId,
        },
        select: {
          pendingConnections: true,
        },
      })
    )?.pendingConnections as Prisma.JsonArray;

    // Retrieve pending received connections
    const pendingReceiveConnections = (
      await prisma.user.findUnique({
        where: {
          id: connectionObj.receiveId,
        },
        select: {
          pendingConnections: true,
        },
      })
    )?.pendingConnections as Prisma.JsonArray;

    const [sendingRequest, receivingRequest] = await prisma.$transaction([
      // Add pending connection to the user requesting.
      prisma.user.update({
        where: {
          id: connectionObj.requestId,
        },
        data: {
          pendingConnections:
            pendingRequestConnections !== null
              ? ([
                  ...pendingRequestConnections,
                  {
                    ...connectionObj,
                    code: 2,
                  },
                ] as Prisma.JsonArray)
              : ([
                  {
                    ...connectionObj,
                    code: 2,
                  },
                ] as Prisma.JsonArray),
        },
      }),

      // Add pending connection to the user receiving request.
      prisma.user.update({
        where: {
          id: connectionObj.receiveId,
        },
        data: {
          pendingConnections:
            pendingReceiveConnections !== null
              ? ([
                  ...pendingReceiveConnections,
                  {
                    ...connectionObj,
                    code: 1,
                  },
                ] as Prisma.JsonArray)
              : ([
                  {
                    ...connectionObj,
                    code: 1,
                  },
                ] as Prisma.JsonArray),
        },
      }),
    ]);

    if (!sendingRequest || !receivingRequest) {
      return {
        error: "Error completing request.",
      };
    }

    revalidatePath("/account");

    return { error: null };
  } catch (error) {
    console.error(error);
    return {
      error: "We were unable to process this request.",
    };
  }
}

export async function deleteConnection(receiveId: string, requestId: string) {
  const session = await verifyUserSession();
  const ownUserId = session.id;

  if (!ownUserId === null) {
    return { error: "Invalid user." };
  }

  if (!requestId || !receiveId) {
    return { error: "Connection details missing." };
  }

  try {
    // Filter out connection where both receive and request id matches.
    const request = await prisma.user.findUnique({
      where: {
        id: requestId,
      },
      select: {
        pendingConnections: true,
      },
    });

    if (!request) {
      return { error: "Connection details missing." };
    }

    const requestsResult = request.pendingConnections as {
      receiveId: string;
      requestId: string;
      businessName: string;
      businessCode: string;
    }[];

    const filteredRequest = requestsResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const receive = await prisma.user.findUnique({
      where: {
        id: receiveId,
      },
      select: {
        pendingConnections: true,
      },
    });

    if (!receive) {
      return { error: "Connection details missing." };
    }

    const receiveResult = receive.pendingConnections as {
      receiveId: string;
      requestId: string;
      businessName: string;
      businessCode: string;
    }[];

    const filteredReceive = receiveResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const [sendingRequest, receivingRequest] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: requestId,
        },
        data: {
          pendingConnections: filteredRequest,
        },
        select: {
          id: true,
        },
      }),
      prisma.user.update({
        where: {
          id: receiveId,
        },
        data: {
          pendingConnections: filteredReceive,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!sendingRequest || !receivingRequest) {
      return {
        error: "We were unable to delete this connection.",
      };
    }

    revalidatePath("/account");

    return {
      error: null,
      message: "Connection deleted.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "We were unable to delete this connection.",
    };
  }
}

export async function deleteActiveConnection(
  receiveId: string,
  requestId: string
) {
  const session = await verifyUserSession();
  const ownUserId = session.id;

  if (!ownUserId === null) {
    return { error: "Invalid user." };
  }

  if (!requestId || !receiveId) {
    return { error: "Connection details missing." };
  }

  try {
    // Filter out connection where both receive and request id matches.
    const request = await prisma.user.findUnique({
      where: {
        id: requestId,
      },
      select: {
        connections: true,
      },
    });

    if (!request) {
      return { error: "Connection details missing." };
    }

    const requestsResult = request.connections as
      | {
          connectionId: string;
          receiveId: string;
          requestId: string;
          businessName: string;
          businessCode: string;
        }[]
      | {
          connectionId: string;
          receiveId: string;
          requestId: string;
          businessName: string;
          businessCode: string;
          name: string;
          email: string;
        }[];

    const filteredRequest = requestsResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const receive = await prisma.user.findUnique({
      where: {
        id: receiveId,
      },
      select: {
        connections: true,
      },
    });

    if (!receive) {
      return { error: "Connection details missing." };
    }

    const receiveResult = receive.connections as
      | {
          connectionId: string;
          receiveId: string;
          requestId: string;
          businessName: string;
          businessCode: string;
        }[]
      | {
          connectionId: string;
          receiveId: string;
          requestId: string;
          businessName: string;
          businessCode: string;
          name: string;
          email: string;
        }[];

    const filteredReceive = receiveResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const [sendingRequest, receivingRequest] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: requestId,
        },
        data: {
          connections: filteredRequest,
        },
        select: {
          id: true,
        },
      }),
      prisma.user.update({
        where: {
          id: receiveId,
        },
        data: {
          connections: filteredReceive,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!sendingRequest || !receivingRequest) {
      return {
        error: "We were unable to delete this connection.",
      };
    }

    revalidatePath("/account");

    return {
      error: null,
      message: "Connection deleted.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "We were unable to delete this connection.",
    };
  }
}

export async function approveConnection(
  receiveId: string,
  requestId: string,
  businessName: string,
  businessCode: string
) {
  const session = await verifyUserSession();
  const ownUserId = session.id;

  if (!ownUserId === null) {
    return { error: "Invalid user." };
  }

  if (!requestId || !receiveId) {
    return { error: "Connection details missing." };
  }

  try {
    // Filter out connection where both receive and request id matches.
    const request = await prisma.user.findUnique({
      where: {
        id: requestId,
      },
      select: {
        pendingConnections: true,
        connections: true,
      },
    });

    if (!request) {
      return { error: "Connection details missing." };
    }

    const requestsResult = request.pendingConnections as {
      receiveId: string;
      requestId: string;
      businessName: string;
      businessCode: string;
    }[];

    const filteredRequest = requestsResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const receive = await prisma.user.findUnique({
      where: {
        id: receiveId,
      },
      select: {
        pendingConnections: true,
        connections: true,
      },
    });

    if (!receive) {
      return { error: "Connection details missing." };
    }

    const receiveResult = receive.pendingConnections as {
      receiveId: string;
      requestId: string;
      businessName: string;
      businessCode: string;
    }[];

    const filteredReceive = receiveResult.filter(
      (r) => r.requestId !== requestId && r.receiveId !== receiveId
    );

    const requestingUser = await prisma.user.findUnique({
      where: { id: requestId },
      select: { name: true, email: true },
    });

    const [sendingRequest, receivingRequest] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: requestId,
        },
        data: {
          pendingConnections: filteredRequest,
          connections:
            request.connections !== null
              ? ([
                  ...(request.connections as Prisma.JsonArray),
                  {
                    connectionId: receiveId,
                    receiveId: receiveId,
                    requestId: requestId,
                    businessName: businessName,
                    businessCode: businessCode,
                  },
                ] as Prisma.JsonArray)
              : ([
                  {
                    connectionId: receiveId,
                    receiveId: receiveId,
                    requestId: requestId,
                    businessName: businessName,
                    businessCode: businessCode,
                  },
                ] as Prisma.JsonArray),
        },
        select: {
          id: true,
        },
      }),
      prisma.user.update({
        where: {
          id: receiveId,
        },
        data: {
          pendingConnections: filteredReceive,
          connections:
            receive.connections !== null
              ? ([
                  ...(receive.connections as Prisma.JsonArray),
                  {
                    connectionId: requestId,
                    receiveId: receiveId,
                    requestId: requestId,
                    businessName: businessName,
                    businessCode: businessCode,
                    name: requestingUser?.name,
                    email: requestingUser?.email,
                  },
                ] as Prisma.JsonArray)
              : ([
                  {
                    connectionId: requestId,
                    receiveId: receiveId,
                    requestId: requestId,
                    businessName: businessName,
                    businessCode: businessCode,
                    name: requestingUser?.name,
                    email: requestingUser?.email,
                  },
                ] as Prisma.JsonArray),
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!sendingRequest || !receivingRequest) {
      return {
        error: "We were unable to add this connection.",
      };
    }

    revalidatePath("/account");

    return {
      error: null,
      message: "Connection added.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "We were unable to add this connection.",
    };
  }
}
