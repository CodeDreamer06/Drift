// lib/db.ts
// IndexedDB utility for storing all generated images

export interface ImageData {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  b64?: string;
}

const DB_NAME = "drift-image-db";
const DB_VERSION = 2; // Bump version for new store
const STORE_NAME = "images";

export function openImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllImages(): Promise<ImageData[]> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as ImageData[]);
    req.onerror = () => reject(req.error);
  });
}

export async function addImages(images: ImageData[]): Promise<void> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    images.forEach(img => store.put(img));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
