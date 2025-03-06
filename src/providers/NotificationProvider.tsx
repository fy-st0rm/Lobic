// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useState,
	useEffect,
} from "react";
import { toast } from "sonner";

// Local
import { SERVER_IP } from "@/const";
import { OpCode, SocketResponse } from "api/socketApi";
import { useAppProvider } from "providers/AppProvider";
import { useSocketProvider } from "providers/SocketProvider";
import AddFriend from "components/Notification/AddFriend";
import RequestedMusic from "components/Notification/RequestedMusic";

/*
 * Notification Type
 * @member {string} id - Id of the notification
 * @member {OpCode} op_code - Type of the notification
 * @member {any} value - Data of the notification
 */

export type Notification = {
	id: string;
	op_code: OpCode;
	value: any;
};

type Notifications = {
	[id: string]: Notification;
};

/*
 * NotificationContext Type
 * @member {Notifications} notifs - The container of notifications
 * @member {Notifications} tempNotifs - The container of notifications that'll get destroyed after certain duration
 * @member {function} addTempNotif - Function to add new temporary notification
 * @member {function} addNotif - Function to add new notification
 */

export type NotificationContextType = {
	notifs: Notifications;
	tempNotifs: Notifications;
	addNotif: (notif: Notification) => void;
	addTempNotif: (notif: Notification) => void;
	removeNotif: (id: string) => void;
};

const defaultContext: NotificationContextType = {
	notifs: {} as Notifications,
	tempNotifs: {} as Notifications,
	addNotif: () => {},
	addTempNotif: () => {},
	removeNotif: () => {},
};

const NotificationContext =
	createContext<NotificationContextType>(defaultContext);

// Notification Provider

export const NotificationProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const { appState } = useAppProvider();
	const { addMsgHandler } = useSocketProvider();

	const [notifs, setNotifs] = useState<Notifications>({} as Notifications);
	const [tempNotifs, setTempNotifs] = useState<Notifications>(
		{} as Notifications,
	);

	// Loads the notification from the backend
	useEffect(() => {
		const getNotifs = async () => {
			let response = await fetch(`${SERVER_IP}/notif/get/${appState.user_id}`);
			if (!response.ok) {
				let log = await response.text();
				console.log(log);
				return;
			}

			let notifs = await response.json();
			console.log(notifs);
			setNotifs(notifs);
		};
		getNotifs();
	}, []);

	// Responsible to handle incoming notifications
	useEffect(() => {
		addMsgHandler(OpCode.NOTIFICATION, (res: SocketResponse) => {
			let notif: Notification = res.value;

			// Adding notification to the list
			setNotifs((prevNotifs) => ({
				...prevNotifs,
				[notif.id]: notif,
			}));

			// Adding to temporary buffer
			addTempNotif(notif);
		});
	}, []);

	const addTempNotif = (notif: Notification) => {
		// Handlers
		const okHandler = async (notif: Notification) => {
			let msg = notif.value;
			toast(<div>{msg}</div>, {
				duration: 5000,
			});
		};

		const addFriendHandler = (notif: Notification) => {
			toast.custom((id) => <AddFriend notif={notif} toastId={id}/>);
		};

		const requestedMusicHandler = (notif: Notification) => {
			toast.custom((id) => <RequestedMusic notif={notif} toastId={id}/>);
		};

		if (notif.op_code === OpCode.OK) {
			okHandler(notif);
		} else if (notif.op_code === OpCode.ADD_FRIEND) {
			addFriendHandler(notif);
		} else if (notif.op_code === OpCode.REQUEST_MUSIC_PLAY) {
			requestedMusicHandler(notif);
		}
	};

	const addNotif = (notif: Notification) => {
		setNotifs((prevNotifs) => ({
			...prevNotifs,
			[notif.id]: notif,
		}));

		// Adding to temporary buffer
		addTempNotif(notif);
	};

	const removeNotif = (id: string) => {
		setNotifs((prevNotifs) => {
			const { [id]: _, ...rest } = prevNotifs;
			return rest;
		});

		const removeFromDB = async () => {
			let response = await fetch(`${SERVER_IP}/notif/delete/${id}`, {
				method: "POST",
				credentials: "include",
			});

			let log = await response.text();
			if (response.ok) {
				console.log(log);
			} else {
				console.error(log);
			}
		};
		removeFromDB();
	};

	return (
		<NotificationContext.Provider
			value={{
				notifs,
				tempNotifs,
				addNotif,
				addTempNotif,
				removeNotif,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotificationProvider = () => useContext(NotificationContext);
