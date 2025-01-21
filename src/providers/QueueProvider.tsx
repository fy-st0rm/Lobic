// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

// Local
import { MusicTrack } from "api/musicApi";

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
	clear: () => MusicTrack | null;
};

// Creating context width default values will be assigned later in providers
const defaultContext: QueueContextType = {
	queue: [],
	enqueue: () => {},
	dequeue: () => null,
	clear: () => null
};

const QueueContext = createContext<QueueContextType>(defaultContext);

export const QueueProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const [queue, setQueue] = useState<MusicTrack[]>([]);

	const enqueue = (track: MusicTrack) => {
		setQueue((prevQueue) => [...prevQueue, track]);
	};

	const dequeue = (): MusicTrack | null => {
		if (queue.length === 0) return null;

		const [first, ...rest] = queue;
		setQueue(rest);
		return first;
	};
	const clear = ():  null => {
		setQueue([]);
		return null;
	};

	// TODO: Remove this in future when queue ui is done
	useEffect(() => {
		console.log(queue);
	}, [queue]);

	return (
		<QueueContext.Provider
			value={{
				queue,
				enqueue,
				dequeue,
				clear,
			}}
		>
			{children}
		</QueueContext.Provider>
	);
};

export const useQueueProvider = () => useContext(QueueContext);
