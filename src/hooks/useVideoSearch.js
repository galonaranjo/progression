import { useState, useMemo } from "react";

function useVideoSearch(videos) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) {
      return videos; // Return all videos if there's no search term
    }
    return videos.filter((video) => video.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [videos, searchTerm]);

  return { searchTerm, setSearchTerm, filteredVideos };
}

export default useVideoSearch;
