import React, { useEffect } from 'react'
import{search, SearchResponse} from "@/api/searchApi";
import { useState } from "react";

interface SearchResultsProps {
    category: string;
    query: string;
  }
  
  const SearchResults: React.FC<SearchResultsProps> = ({ category, query }) => {
   
    const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
    const param = category.toLowerCase();
    useEffect(() => {
    const fetchData = async () => { 
        const data = await search(param, query);
        setSearchResults(data);
    };
    fetchData();
    }, [param, query]);
    return(
       <>
       {category === "All" && (
         <>
         {searchResults?.people.map((user) => (
            <div>
              <h1>{user.username}</h1>
            </div>
         ))}
         {searchResults?.songs.map((song) => (
            <div>
              <h1>{song.title}</h1>
            </div>
         ))}
         {searchResults?.playlists.map((playlist) => (
            <div>
              <h1>{playlist.playlist_name}</h1>
            </div>
         ))}
         </>
       )}
       {category === "Songs" && (
         <>
         {searchResults?.songs.map((song) => (
            <div>
              <h1>{song.title}</h1>
            </div>
         ))}
         </>
       )}
       {category === "People" && (
         <>
         {searchResults?.people.map((user) => (
            <div>
              <h1>{user.username}</h1>
            </div>
         ))}
         </>
       )}
         {category === "Playlists" && ( 
      
            searchResults?.playlists.map((playlist) => (
                <div>
                    <h1>{playlist.playlist_name}</h1>
                </div>
            )
        ))}


       </>
    );
  };

export default SearchResults
