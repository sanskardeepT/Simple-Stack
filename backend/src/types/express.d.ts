declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        userId: string;
        role: "admin" | "editor" | "viewer";
        email: string;
      };
    }
  }
}

export {};
