function connectDB (dbName = 'my_idb', version = 1, storeName = 'my_store') {
  return new Promise(function (resolve, reject) {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported'))
    }
    const request = indexedDB.open(dbName, version);
    request.onerror = reject;
    request.onsuccess = function (event) {
      resolve(event.target.result);
    }
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (event.oldVersion === 0 
        && !db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'mid' });
        store.createIndex(`${storeName}_Index`, 'mid', { unique: true });
      }
    };
  });
}

function saveData (db, store, key, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.put({ mid: key, data: data});
    request.onsuccess = () => resolve(db);
    request.onerror = reject;
  })
}

function queryData (db, store, key) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = reject;
    } catch (error) {
      reject(error);
    }
  });
}