declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        userId: string;
        role: "superadmin" | "user";
        email: string;
      };
    }
  }
}

export {};
