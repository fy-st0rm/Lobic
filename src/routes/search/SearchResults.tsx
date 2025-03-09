import React, { useEffect } from "react";
import { search, SearchResponse } from "@/api/searchApi";
import { useState } from "react";
import Music from "@/routes/home/Music";
import { useMusicProvider, MusicState } from "@/providers/MusicProvider";
import { MPState } from "@/api/music/musicApi";
import { Playlist, Song } from "@/api/playlist/playlistApi";
import { useNavigate } from "react-router-dom";
import { PlaylistCard } from "@/routes/playlists/AllPlaylists";
interface SearchResultsProps {
	category: string;
	query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ category, query }) => {
	const [searchResults, setSearchResults] = useState<SearchResponse | null>(
		null,
	);
	const param = category.toLowerCase();
	const { updateMusicState } = useMusicProvider();
	const navigate = useNavigate();
	useEffect(() => {
		const fetchData = async () => {
			let data;
			if (param === "songs") {
				data = await search("title", query);
				setSearchResults(data);
			} else {
				data = await search(param, query);
				setSearchResults(data);
			}
		};
		fetchData();
	}, [param, query]);

	const handleMusicClick = async (song: Song): Promise<void> => {
		try {
			updateMusicState({
				id: song.music_id,
				title: song.title,
				artist: song.artist,
				image_url: song.image_url,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
		} catch (err) {
			console.error("Failed to handle music click:", err);
		}
	};
	return (
		<>
			{category === "All" && (
				<>
					<div className="text-xl text-primary_fg font-semibold mx-7 mt-2">
						Songs
					</div>
					<div className="flex flex-wrap mx-3">
						{searchResults?.songs.map((song) => (
							<div className="flex">
								<Music
									musicId={song.id}
									title={song.title}
									artist={song.artist}
									album={song.album}
									image_url={song.image_url}
									onClick={() =>
										handleMusicClick({
											...song,
											music_id: song.id,
											song_added_date_time: new Date().toISOString(),
											song_adder_id: "default_adder_id",
										})
									}
								/>
							</div>
						))}
					</div>
					<div className="text-xl text-primary_fg font-semibold mx-7 mt-2">
						Playlists
					</div>
					<div className="flex flex-wrap">
						{searchResults?.playlists.map((playlist: Playlist) => (
							<PlaylistCard key={playlist.playlist_id} playlist={playlist} />
						))}
					</div>
					<div className="text-xl text-primary_fg font-semibold mx-7 mt-2">
						People
					</div>
					{searchResults?.people.map((user) => (
						<div>
							<h1>{user.username}</h1>
						</div>
					))}
				</>
			)}
			{category === "Songs" && (
				<div className="flex flex-wrap">
					{searchResults?.songs.map((song) => (
						<div className="flex">
							<Music
								musicId={song.id}
								title={song.title}
								artist={song.artist}
								album={song.album}
								image_url={song.image_url}
								onClick={() =>
									handleMusicClick({
										...song,
										music_id: song.id,
										song_added_date_time: new Date().toISOString(),
										song_adder_id: "default_adder_id",
									})
								}
							/>
						</div>
					))}
				</div>
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
				<div className="flex flex-wrap">
					{searchResults?.playlists.map((playlist: Playlist) => (
						<PlaylistCard key={playlist.playlist_id} playlist={playlist} />
					))}
				</div>
			)}
		</>
	);
};

export default SearchResults;
