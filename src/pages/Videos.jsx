import { useState, useEffect } from "react";
import VideoItem from "../components/VideoItem";
import SearchBar from "../components/SearchBar";
import useVideoSearch from "../hooks/useVideoSearch";
import AddVideoButton from "../components/AddVideoButton";
import Masonry from "react-masonry-css";
import { loadVideos } from "../api/youtubeApi";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm, setSearchTerm, filteredVideos } = useVideoSearch(videos);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedVideos = await loadVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Failed to load videos:", error);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleVideoRecorded = async (videoBlob) => {
  //   // TODO: Implement YouTube upload logic
  //   console.log("Video recorded, implement YouTube upload logic");
  // };

  // const handleVideoUploaded = async (file) => {
  //   // TODO: Implement YouTube upload logic
  //   console.log("Video file selected, implement YouTube upload logic");
  // };

  // const handleDeleteVideo = async (id) => {
  //   // TODO: Implement YouTube delete logic
  //   console.log("Delete video requested, implement YouTube delete logic");
  // };

  // const handleAddTag = async (videoId, newTags) => {
  //   // TODO: Implement YouTube tag addition logic
  //   console.log("Add tag requested, implement YouTube tag addition logic");
  // };

  // const handleRemoveTag = async (videoId, tagToRemove) => {
  //   // TODO: Implement YouTube tag removal logic
  //   console.log("Remove tag requested, implement YouTube tag removal logic");
  // };

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 2,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1024px]">
      <div className="flex mb-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddVideoButton onVideoRecorded={() => {}} onVideoUploaded={() => {}} />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mt-8">
        {isLoading ? (
          <p className="text-gray-600">Loading videos...</p>
        ) : filteredVideos.length === 0 ? (
          <p className="text-gray-600">No videos found. Try a different search term or upload a new video.</p>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column">
            {filteredVideos.map((video) => (
              <div key={video.id} className="mb-4">
                <VideoItem video={video} onDelete={() => {}} onAddTag={() => {}} onRemoveTag={() => {}} />
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
}

export default Videos;
