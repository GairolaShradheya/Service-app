import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// simple in‑memory storage (used by default for local development)
export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

/**
 * Firestore-backed storage implementation. When the NODE_ENV is
 * `production` or if the FIREBASE_USE_FIRESTORE env var is truthy,
 * this class will be used instead of the in‑memory map. It requires
 * the Firebase Admin SDK to be configured with credentials (see
 * README or the docs below).
 */
import admin from "firebase-admin";

export class FirestoreStorage implements IStorage {
  private db: admin.firestore.Firestore;
  private collection: admin.firestore.CollectionReference;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    this.db = admin.firestore();
    this.collection = this.db.collection("users");
  }

  private docToUser(doc: admin.firestore.DocumentSnapshot): User {
    const data = doc.data() || {};
    return { id: doc.id, ...(data as Omit<User, "id">) } as User;
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return undefined;
    return this.docToUser(doc);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = await this.collection.where("username", "==", username).limit(1).get();
    if (q.empty) return undefined;
    return this.docToUser(q.docs[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await this.collection.doc(id).set(user);
    return user;
  }
}

// choose appropriate storage implementation
export const storage: IStorage =
  process.env.FIREBASE_USE_FIRESTORE || process.env.NODE_ENV === "production"
    ? new FirestoreStorage()
    : new MemStorage();
