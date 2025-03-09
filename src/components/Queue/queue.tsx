import React, { useState, createContext, useContext,  useEffect, PropsWithChildren } from "react";
import { useQueueProvider } from "providers/QueueProvider";
import { ImageFromUrl, MPState, MusicTrack as Song} from "@/api/music/musicApi";
import { useMusicProvider, MusicState} from "@/providers/MusicProvider";
import { X } from 'lucide-react';


type QueueContextType = {
	isVisible: boolean,
	toggleQueue: () => void
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueStateProvider :  React.FC<PropsWithChildren>= ({children})=>{
	const [isVisible, setIsVisible] = useState(()=> {
		const savedState = localStorage.getItem("isVisible");
		return savedState !== null ? JSON.parse(savedState) : true;
	});

	useEffect(() => {
		localStorage.setItem("isVisible", JSON.stringify(isVisible));
	}, [isVisible]);

	const toggleQueue = () => {
		setIsVisible((prev: any) => !prev);
	};

	return(
		<QueueContext.Provider value = {{isVisible , toggleQueue}}>
			{children}
		</QueueContext.Provider>
	)
};

export const useQueueState = () => {
	const context = useContext(QueueContext);
	if (!context) {
		throw new Error("useSidebarState must be used within a SidebarProvider");
	}
	return context;
};

function Queue() {
	const { isVisible, toggleQueue} = useQueueState();
	const { queue,dequeue, dequeueUntil } = useQueueProvider();
	const { musicState,updateMusicState, controlsDisabled } = useMusicProvider();
	const [heights, setHeights] = useState([5, 4, 2]);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	useEffect(() => {
		if (musicState.state === MPState.PLAY) {
			setIsPlaying(true);
		} else if (musicState.state === MPState.PAUSE) {
			setIsPlaying(false);
		} else if (musicState.state === MPState.EMPTY) {
			setIsPlaying(false);
		}
	}, [musicState.state]);
	
	const handleMusicClick = async (song: Song): Promise<void> => {
		try {
			if (controlsDisabled) return;

			updateMusicState({
				id: song.id,
				title: song.title,
				artist: song.artist,
				image_url: song.image_url,
				state: MPState.CHANGE_MUSIC,
			} as MusicState);
			dequeueUntil(song.id);
		} catch (err) {
			console.error("Failed to handle music click:", err);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setHeights(heights.map(() => Math.floor(Math.random() * 7) + 1));
		}, 100);
		return () => clearInterval(interval);
	}, [heights]);

	return (
		<>
			<div
				className={`transition-all justify-between bg-secondary mr-2 overflow-scroll rounded-lg flex-shrink-0 no-scrollbar ${isVisible ? "w-[400px]" : "h-0 w-0"}`}
			>
				<div>
					<div className="p-2 mx-3 my-2 mt-4 text-lg text-primary_fg font-bold flex justify-between ">
						<div>Currently Playing</div>
						<div> <X className = {` right-7 cursor-pointer text-primary_fg opacity-50 hover:opacity-100 transition-all ${isVisible? 'fixed':'hidden'} `}onClick={toggleQueue} /></div>
					</div>
					<div className="">
						<div className={`flex items-center justify-between font-bold px-6 pb-2 transition-all`}>
							<div className={`h-[50px] w-[50px] self-start rounded-sm ${musicState?.image_url ? 'h-[100%] w-[100%]': 'h-0 w-0 hidden'}`}>
								<img
									src={ musicState?.image_url ? ImageFromUrl(musicState.image_url) : '' }
									className={` rounded-sm `}
								/>
							</div>

							<div className="mx-2 grow">
								<div className=" text-sm font-bold text-vivid  overflow-hidden">
									{musicState?.title}
								</div>
								<div className=" text-sm font-semibold	text-white opacity-40 text-nowrap overflow-hidden">
									{musicState?.artist || ""}
								</div>
							</div>
						
							<div className={isPlaying ? "items-center flex gap-1 h-7 p-2 rounded-md":'hidden'}>
								{heights.map((height, index) => (
									<div
										key={index}
										className={`w-1 rounded-lg bg-vivid transition-all duration-300`}
										style={{ height: `${height * 4}px` }}
									></div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="">
					<div className="p-2 mx-3 text-lg text-primary_fg font-bold "> Queue
						<div className="w-10 h-1 rounded-lg relative bg-vivid left-2"></div>
					</div>
				
					{queue.map((item) => (
						<div className="flex items-center font-bold p-2 rounded-sm mx-4 my-2 transition-all hover:bg-primary_fg hover:bg-opacity-20 cursor-pointer" onClick={()=>handleMusicClick(item) }>
							<div className="h-[50px] w-[50px] self-start rounded-sm">
								<img
									src={ImageFromUrl(item.image_url)}
									alt="Album cover"
									className="h-[100%] w-[100%] rounded-sm"
								/>
							</div>
							<div className="mx-2">
								<div className="text-sm font-bold text-primary_fg  overflow-hidden">
									{item.title}
								</div>
								<div className="text-sm font-normal  text-white opacity-40 text-nowrap overflow-hidden">
									{item.artist}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};

export default Queue;
