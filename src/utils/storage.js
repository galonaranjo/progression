import { openDB } from "idb";

const dbPromise = openDB("VideoApp", 1, {
  upgrade(db) {
    db.createObjectStore("videos");
  },
});

export async function saveVideo(key, value) {
  return (await dbPromise).put("videos", value, key);
}

export async function getVideos() {
  return (await dbPromise).getAll("videos");
}

export async function deleteVideo(key) {
  return (await dbPromise).delete("videos", key);
}
