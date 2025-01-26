// Node modules
import React, {
	FC,
	createContext,
	useContext,
	useState,
	useEffect,
} from "react";

// Local
import { OpCode, SocketResponse } from "api/socketApi";
import { useSocketProvider } from "providers/SocketProvider";

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
 * @member {function} addNotif - Function to add new notification
 */

export type NotificationContextType = {
	notifs: Notifications;
	addNotif: (notif: Notification) => void;
	removeNotif: (id: string) => void;
};

const defaultContext: NotificationContextType = {
	notifs: {} as Notifications,
	addNotif: () => {},
	removeNotif: () => {},
};

const NotificationContext =
	createContext<NotificationContextType>(defaultContext);

// Notification Provider

export const NotificationProvider: FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	const { addMsgHandler } = useSocketProvider();

	// TODO: Write a loader for notification when notifications are stored in backend
	const [notifs, setNotifs] = useState<Notifications>({} as Notifications);

	// Responsible to handle incoming notifications
	useEffect(() => {
		addMsgHandler(OpCode.NOTIFICATION, (res: SocketResponse) => {
			let notif: Notification = res.value;

			// Adding notification to the list
			setNotifs((prevNotifs) => ({
				...prevNotifs,
				[notif.id]: notif,
			}));
		});
	}, []);

	const addNotif = (notif: Notification) => {
		setNotifs((prevNotifs) => ({
			...prevNotifs,
			[notif.id]: notif,
		}));
	};

	const removeNotif = (id: string) => {
		setNotifs((prevNotifs) => {
			const { [id]: _, ...rest } = prevNotifs;
			return rest;
		});
	};

	return (
		<NotificationContext.Provider
			value={{
				notifs,
				addNotif,
				removeNotif,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotificationProvider = () => useContext(NotificationContext);
