"use client";

const DB_NAME = "vnp_guest_media_drafts";
const DB_VERSION = 1;
const STORE_NAME = "files";

type GuestVideoDraftRecord = {
  id: string;
  file: File;
  name: string;
  type: string;
  lastModified: number;
  createdAt: number;
};

function openGuestMediaDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Cannot open IndexedDB"));
  });
}

function runStoreOperation<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T> | void
) {
  return new Promise<T | undefined>(async (resolve, reject) => {
    let db: IDBDatabase;

    try {
      db = await openGuestMediaDb();
    } catch (error) {
      reject(error);
      return;
    }

    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    if (request) {
      request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
      request.onsuccess = () => resolve(request.result);
    }

    transaction.oncomplete = () => {
      db.close();
      if (!request) resolve(undefined);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error("IndexedDB transaction failed"));
    };
  });
}

export async function saveGuestPortfolioVideoFiles(files: File[]) {
  const ids: string[] = [];

  for (const file of files) {
    const id = `survey-video-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: GuestVideoDraftRecord = {
      id,
      file,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      createdAt: Date.now(),
    };

    await runStoreOperation("readwrite", (store) => store.put(record));
    ids.push(id);
  }

  return ids;
}

export async function loadGuestPortfolioVideoFiles(ids: string[]) {
  const records: GuestVideoDraftRecord[] = [];

  for (const id of ids) {
    const record = await runStoreOperation<GuestVideoDraftRecord>("readonly", (store) => store.get(id));
    if (record?.file) records.push(record);
  }

  return records;
}

export async function clearGuestPortfolioVideoFiles(ids: string[]) {
  await Promise.all(
    ids.map((id) => runStoreOperation("readwrite", (store) => store.delete(id)).catch(() => undefined))
  );
}
