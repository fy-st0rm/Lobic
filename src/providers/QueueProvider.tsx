// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

// Local
import { MPState, MusicTrack } from "api/musicApi";
import { useMusicProvider } from "providers/MusicProvider";

/*
 * QueueContext Type
 * @member {MusicTrack[]} queue - Holds the array of MusicTrack
 * @member {function} enqueue - Function to insert new track into the queue
 * @member {function} dequeue - Function to pop the first element of the queue
 */

export type QueueContextType = {
	queue: MusicTrack[];
	enqueue: (track: MusicTrack) => void;
	dequeue: () => MusicTrack | null;
	clearQueue: () => void;
};

// Creating context width default values will be assigned later in providers
const defaultContext: QueueContextType = {
	queue: [],
	enqueue: () => {},
	dequeue: () => null,
	clearQueue: () => {},
};

const QueueContext = createContext<QueueContextType>(defaultContext);

export const QueueProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const { musicState, updateMusicState } = useMusicProvider();

	const [queue, setQueue] = useState<MusicTrack[]>([]);

	const enqueue = (track: MusicTrack) => {
		setQueue((prevQueue) => {
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
				return [];
			}
			return [...prevQueue, track]
		});

	};

	const dequeue = (): MusicTrack | null => {
		if (queue.length === 0) return null;

		const [first, ...rest] = queue;
		setQueue(rest);
		return first;
	};

	const clearQueue = () => {
		setQueue([]);
	};

	return (
		<QueueContext.Provider
			value={{
				queue,
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
