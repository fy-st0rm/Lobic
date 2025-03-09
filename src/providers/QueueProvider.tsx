// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

// Local
import { MPState, MusicTrack } from "@/api/music/musicApi";
import { OpCode, wsSend } from "api/socketApi";
import { useMusicProvider } from "providers/MusicProvider";
import { useLobbyProvider } from "providers/LobbyProvider";
import { useSocketProvider } from "providers/SocketProvider";

/*
 * QueueContext Type
 * @member {MusicTrack[]} queue - Holds the array of MusicTrack
 * @member {function} enqueue - Function to insert new track into the queue
 * @member {function} dequeue - Function to pop the first element of the queue
 */

export type QueueContextType = {
	queue: MusicTrack[];
	reverseQueue: MusicTrack[];
	updateQueue: (queue: MusicTrack[]) => void;
	enqueue: (track: MusicTrack) => void;
	dequeue: () => MusicTrack | null;
	dequeueUntil: (trackId: string) => void,
	clearQueue: () => void;
	dequeueReverse: () => MusicTrack | null;
	enqueueReverse: (track: MusicTrack) => void;
	enqueueWhenReversed: (track: MusicTrack) => void
};

// Creating context width default values will be assigned later in providers
const defaultContext: QueueContextType = {
	queue: [],
	reverseQueue: [],
	updateQueue: () => {},
	enqueue: () => {},
	dequeue: () => null,
	dequeueUntil: () => {},
	clearQueue: () => {},
	dequeueReverse: () => null,
	enqueueReverse: () => {},
	enqueueWhenReversed: ()=>{}
};

const QueueContext = createContext<QueueContextType>(defaultContext);

/*
 * Loads QueueState from session storage
 * @returns {MusicTrack[]} - The loaded queue state
 */

const loadQueueState = (): MusicTrack[] => {
	const savedState = sessionStorage.getItem("QueueState");
	return savedState ? JSON.parse(savedState).queue : [];
};

export const QueueProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const { musicState, updateMusicState } = useMusicProvider();
	const { lobbyState } = useLobbyProvider();
	const { getSocket } = useSocketProvider();

	const [queue, setQueue] = useState<MusicTrack[]>(loadQueueState);
	const [reverseQueue, setReverseQueue] = useState<MusicTrack[]>([]);

	useEffect(() => {
		if (lobbyState.in_lobby && lobbyState.is_host) {
			const payload = {
				op_code: OpCode.SET_QUEUE,
				value: {
					lobby_id: lobbyState.lobby_id,
					queue: queue.map((item) => {
						return {
							id: item.id,
							title: item.title,
							artist: item.artist,
							album: item.album,
							image_url: item.image_url,
							timestamp: 0,
							state: MPState.PAUSE,
						};
					}),
				},
			};
			wsSend(getSocket(), payload);
		}
	}, [queue]);

	useEffect(() => {
		// Play the song if the current song is not set
		if (queue.length > 0 && !musicState.id) {
			let track = queue[0];
			updateMusicState({
				id: track.id,
				title: track.title,
				artist: track.artist,
				album: track.album,
				image_url: track.image_url,
				state: MPState.CHANGE_MUSIC,
			});
			enqueueReverse(track);
			dequeue();
		}
	}, [queue]);
	
	const updateQueue = (newQueue: MusicTrack[]) => {
		setQueue((prevQueue) => {
			const newState = {
				queue: newQueue,
			};
			sessionStorage.setItem("QueueState", JSON.stringify(newState));
			return newQueue;
		});
	};


	const enqueue = (track: MusicTrack) => {
		setQueue((prevQueue) => {
			let newQueue: MusicTrack[] = [...prevQueue, track];
			const newState = {
				queue: newQueue,
			};
			sessionStorage.setItem("QueueState", JSON.stringify(newState));
			return newQueue;
		});
	};
	
	const enqueueReverse = (track: MusicTrack) => {
		setReverseQueue((prevQueue) => {
			let newQueue: MusicTrack[] = [track, ...prevQueue];
			return newQueue;
		});

		return track;
	};
	const dequeueReverse = () => {
		if (reverseQueue.length === 0) return null;
		const [first, ...rest] =  reverseQueue;
		setReverseQueue(rest);
		return first;
	}
	const enqueueWhenReversed = (track: MusicTrack) => {
		setQueue((prevQueue) => {
			let newQueue: MusicTrack[] = [track, ...prevQueue];
			const newState = {
				queue: newQueue,
			};
			sessionStorage.setItem("QueueState", JSON.stringify(newState));
			return newQueue;
		});
	};

	const dequeue = (): MusicTrack | null => {
		if (queue.length === 0) return null;
		const [first, ...rest] = queue;
		updateQueue(rest);
		return first;
	};

	const dequeueUntil = (trackId: string) => {
		setQueue((prevQueue) => {
			let newQueue = prevQueue;

			let idx = prevQueue.findIndex(track => track.id === trackId);
			prevQueue.map((track, index) => {
				if (index < idx) {
					enqueueReverse(track);
				}
			});
			console.log(reverseQueue);

		
			if (idx !== -1) {
				
				newQueue = prevQueue.slice(idx+1)
				
			}

			const newState = {
				queue: newQueue,
			};
			sessionStorage.setItem("QueueState", JSON.stringify(newState));
			return newQueue;
		});
	};

	const clearQueue = () => {
		updateQueue([]);
		setReverseQueue([]);
	};

	return (
		<QueueContext.Provider
			value={{
				queue,
				reverseQueue,
				updateQueue,
				enqueue,
				dequeue,
				dequeueUntil,
				clearQueue,
				dequeueReverse,
				enqueueReverse,
				enqueueWhenReversed
				
				
			}}
		>
			{children}
		</QueueContext.Provider>
	);
};

export const useQueueProvider = () => useContext(QueueContext);
