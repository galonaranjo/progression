import algoliasearch from "algoliasearch";

const client = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_ADMIN_API_KEY);
const index = client.initIndex("videos");

export const initializeAlgoliaIndex = async () => {
  try {
    await index.setSettings({
      searchableAttributes: ["title", "id"],
    });
    console.log("Algolia index initialized successfully");
  } catch (error) {
    console.error("Error initializing Algolia index:", error);
  }
};

export const addToAlgoliaIndex = async (video) => {
  try {
    await index.saveObject({
      objectID: video.id,
      ...video,
    });
  } catch (error) {
    console.error("Error adding video to Algolia index:", error);
  }
};

export const removeFromAlgoliaIndex = async (objectID) => {
  try {
    await index.deleteObject(objectID);
  } catch (error) {
    console.error("Error removing video from Algolia index:", error);
  }
};
