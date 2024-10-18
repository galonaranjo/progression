import { openDB } from "idb";

const dbPromise = openDB("VideoApp", 1, {
  upgrade(db) {
    db.createObjectStore("videos");
  },
});

export async function saveVideo(key, value) {
  return (await dbPromise).put(
    "videos",
    {
      ...value,
      tags: value.tags || [],
      thumbnailUrl: value.thumbnailUrl,
      created_on: value.created_on,
      uploaded_on: value.uploaded_on,
    },
    key
  );
}

export async function getVideos() {
  return (await dbPromise).getAll("videos");
}

export async function deleteVideo(key) {
  return (await dbPromise).delete("videos", key);
}

export async function updateVideo(key, value) {
  return (await dbPromise).put(
    "videos",
    {
      ...value,
      tags: value.tags || [],
      thumbnailUrl: value.thumbnailUrl,
      created_on: value.created_on,
      uploaded_on: value.uploaded_on,
    },
    key
  );
}

export async function clearLocalVideos() {
  const db = await dbPromise;
  const tx = db.transaction("videos", "readwrite");
  await tx.objectStore("videos").clear();
  await tx.done;
}
