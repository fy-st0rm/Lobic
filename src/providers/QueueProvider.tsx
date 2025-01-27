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
	updateQueue: (queue: MusicTrack[]) => void;
	enqueue: (track: MusicTrack) => void;
	dequeue: () => MusicTrack | null;
	clearQueue: () => void;
};

// Creating context width default values will be assigned later in providers
const defaultContext: QueueContextType = {
	queue: [],
	updateQueue: () => {},
	enqueue: () => {},
	dequeue: () => null,
	clearQueue: () => {},
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
							cover_img: item.cover_img,
							timestamp: 0,
							state: MPState.PAUSE,
						};
					}),
				},
			};
			wsSend(getSocket(), payload);
		}
	}, [queue]);

	const updateQueue = (queue: MusicTrack[]) => {
		const newState = {
			queue: queue,
		};
		sessionStorage.setItem("QueueState", JSON.stringify(newState));
		setQueue(queue);
	};

	const enqueue = (track: MusicTrack) => {
		setQueue((prevQueue) => {
			let newQueue: MusicTrack[] = [];

			// Play the song if the current song is not set
			if (queue.length === 0 && !musicState.id) {
				updateMusicState({
					id: track.id,
					title: track.title,
					artist: track.artist,
					cover_img: track.cover_img,
					timestamp: 0,
					state: MPState.CHANGE_MUSIC,
				});
				newQueue = [];
			} else {
				newQueue = [...prevQueue, track];
			}

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

	const clearQueue = () => {
		updateQueue([]);
	};

	return (
		<QueueContext.Provider
			value={{
				queue,
				updateQueue,
				enqueue,
				dequeue,
				clearQueue,
			}}
		>
			{children}
		</QueueContext.Provider>
	);
};

export const useQueueProvider = () => useContext(QueueContext);
