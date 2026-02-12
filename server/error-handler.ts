/**
 * Formats database errors into user-friendly messages
 */
export function formatDatabaseError(error: any): { message: string; status: number } {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  // PostgreSQL error codes
  if (errorCode === "42P01" || errorMessage.includes("does not exist")) {
    return {
      message: "Database tables not found. Please run 'npm run db:push' to create the required tables.",
      status: 500,
    };
  }

  if (errorCode === "23505" || errorMessage.includes("duplicate key")) {
    return {
      message: "A record with this information already exists.",
      status: 409,
    };
  }

  if (errorCode === "23503" || errorMessage.includes("foreign key")) {
    return {
      message: "Invalid reference. The related record does not exist.",
      status: 400,
    };
  }

  if (errorCode === "28P01" || errorMessage.includes("password authentication failed")) {
    return {
      message: "Database authentication failed. Please check your DATABASE_URL.",
      status: 500,
    };
  }

  if (errorCode === "3D000" || errorMessage.includes("database") && errorMessage.includes("does not exist")) {
    return {
      message: "Database not found. Please check your DATABASE_URL.",
      status: 500,
    };
  }

  if (errorMessage.includes("SSL") || errorMessage.includes("TLS")) {
    return {
      message: "SSL/TLS connection required. Please add '?sslmode=require' to your DATABASE_URL.",
      status: 500,
    };
  }

  // Default database error
  if (errorCode?.startsWith("42") || errorCode?.startsWith("23") || errorCode?.startsWith("28")) {
    return {
      message: `Database error: ${errorMessage}`,
      status: 500,
    };
  }

  // Return original error if not a database error
  return {
    message: errorMessage,
    status: 500,
  };
}

