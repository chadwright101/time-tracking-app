let db;
const DB_NAME = "TimeTrackerDB";
const STORE_NAME = "timeEntries";
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Error opening DB", event);
      reject("Error");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("project", "project", { unique: false });
        store.createIndex("startTime", "startTime", { unique: false });
        store.createIndex("endTime", "endTime", { unique: false });
      }
    };
  });
};

export const addTimeEntry = (entry) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error("Error adding entry", event);
        reject("Error");
      };
    });
  });
};

export const updateTimeEntry = (id, updates) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        const updatedEntry = { ...data, ...updates };
        const updateRequest = store.put(updatedEntry);

        updateRequest.onsuccess = () => resolve(updateRequest.result);
        updateRequest.onerror = (event) => {
          console.error("Error updating entry", event);
          reject("Error");
        };
      };

      getRequest.onerror = (event) => {
        console.error("Error getting entry to update", event);
        reject("Error");
      };
    });
  });
};

export const getAllTimeEntries = () => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error("Error getting entries", event);
        reject("Error");
      };
    });
  });
};

export const getEntriesByProject = (project) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("project");
      const request = index.getAll(project);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error("Error getting entries by project", event);
        reject("Error");
      };
    });
  });
};

export const deleteTimeEntry = (id) => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error deleting entry", event);
        reject("Error");
      };
    });
  });
};

// Add these new functions to your existing idbService.js

export const exportAllData = async () => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = {
          version: 1,
          createdAt: new Date().toISOString(),
          entries: request.result,
        };
        resolve(data);
      };
      request.onerror = (event) => {
        console.error("Error exporting data", event);
        reject("Export failed");
      };
    });
  });
};

export const clearAllData = async () => {
  return new Promise((resolve, reject) => {
    initDB().then((db) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error clearing data", event);
        reject("Clear failed");
      };
    });
  });
};
