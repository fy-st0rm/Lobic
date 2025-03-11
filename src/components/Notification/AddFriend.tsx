// Node modules
import React, { FC, useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Local
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import { useAppProvider } from "providers/AppProvider";
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import {
	User,
	fetchUserProfilePicture,
	getUserData,
} from "api/user/userApi";
import { addFriend } from "api/friendApi";


type AddFriendProps = {
	notif: Notification,
	toastId: string | number,
};

const AddFriend: FC<AddFriendProps> = ({ notif, toastId }): React.ReactElement => {
	const { appState } = useAppProvider();
	const { addTempNotif, removeNotif } = useNotificationProvider();

	const [userId, setUserId] = useState<string>(notif.value);
	const [userData, setUserData] = useState<User | null>(null);
	const [pfp, setPfp] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			let user = await getUserData(userId);
			setUserData(user);

			let pfp = await fetchUserProfilePicture(userId);
			setPfp(pfp);
		};
		fetchData();
	}, []);

	const onAccept = async () => {
		// Add friend
		try { 
			addFriend(appState.user_id, userId);
		} catch (err) {
			console.error(err);
		}

		toast.dismiss(toastId);

		// Remove the notification
		removeNotif(notif.id);

		// Add a new temporary notification for sucess message
		addTempNotif({
			id: uuidv4(),
			op_code: OpCode.OK,
			value: `@${userData?.username} is now your friend!`,
		});
	};

	const onReject = async () => {
		toast.dismiss(toastId);

		// Remove the notification
		removeNotif(notif.id);
	};

	return (
		<>
			{userData && pfp ? (
				<div className="
						flex flex-col
						bg-secondary
						rounded-[13px] overflow-hidden p-2
					">
					<div className="flex items-center">
						<img
							src={pfp}
							className="w-[40px] h-[40px] rounded-[10px]"
						/>
						<div className="
							flex items-center
							text-primary_fg
							px-3 space-x-2
							overflow-x-auto no-scrollbar whitespace-nowrap
						">
							<div className="text-semibold text-xl">
								@{userData.username}
							</div>
							<div className="text-secondary_fg opacity-70">
								sent you a friend request.
							</div>
						</div>
					</div>

					<div className="flex ml-auto space-x-2">
						<button onClick={onAccept} className="
							flex items-center justify-center
							w-10 h-10
							bg-green-500 hover:bg-green-600 text-white
							rounded-lg shadow-md transition
						">
							<Check className="w-6 h-6" />
						</button>
						<button onClick={onReject} className="
							flex items-center justify-center
							w-10 h-10
							bg-red-500 hover:bg-red-600 text-white
							rounded-lg shadow-md transition
						">
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>
			) : (
				<div>
					Loading...
				</div>
			)}
		</>
	);
};

export default AddFriend;
