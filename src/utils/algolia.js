import algoliasearch from "algoliasearch";

const client = algoliasearch("YOUR_APP_ID", "YOUR_ADMIN_API_KEY");
const index = client.initIndex("videos");

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
