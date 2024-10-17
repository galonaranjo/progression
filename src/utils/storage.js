import { openDB } from "idb";

const dbPromise = openDB("VideoApp", 1, {
  upgrade(db) {
    db.createObjectStore("videos");
  },
});

export async function saveVideo(key, value) {
  // Ensure that tags are included in the value object
  return (await dbPromise).put("videos", { ...value, tags: value.tags || [] }, key);
}

export async function getVideos() {
  return (await dbPromise).getAll("videos");
}

export async function deleteVideo(key) {
  return (await dbPromise).delete("videos", key);
}

export async function updateVideo(key, value) {
  // Ensure that tags are included in the update
  return (await dbPromise).put("videos", { ...value, tags: value.tags || [] }, key);
}

export async function clearLocalVideos() {
  const db = await dbPromise;
  const tx = db.transaction("videos", "readwrite");
  await tx.objectStore("videos").clear();
  await tx.done;
}
