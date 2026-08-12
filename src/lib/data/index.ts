import { FileStore } from "./file-store";
import type { DataStore } from "./store";

let store: DataStore | undefined;

export const getStore = async (): Promise<DataStore> => {
  if (store) return store;
  if (process.env.DATABASE_URL?.startsWith("postgres")) {
    const { PrismaStore } = await import("./prisma-store");
    store = new PrismaStore();
  } else {
    store = new FileStore();
  }
  return store;
};
