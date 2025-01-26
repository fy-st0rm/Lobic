// Node modules
import React, { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// Local
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import { useAppProvider } from "providers/AppProvider";
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import { fetchUserProfilePicture, getUserData, addFriend } from "api/userApi";

const NotificationSystem = (): React.ReactElement => {
	const { appState } = useAppProvider();
	const { tempNotifs, addTempNotif, removeNotif } = useNotificationProvider();

	// Notification handlers according to there opcodes
	useEffect(() => {
		Object.entries(tempNotifs).map(([id, notif]) => {
			if (notif.op_code === OpCode.OK) {
				okHandler(notif);
			} else if (notif.op_code === OpCode.ADD_FRIEND) {
				addFriendHandler(notif);
			}
		});
	}, [tempNotifs]);

	// Handlers
	const okHandler = async (notif: Notification) => {
		let msg = notif.value;
		toast(
			<div>
				{msg}
			</div>,
			{
				duration: 5000,
			},
		);
	};

	const addFriendHandler = async (notif: Notification) => {
		let user_id = notif.value;

		let user = await getUserData(user_id);
		let pfp = await fetchUserProfilePicture(user_id);

		const onAccept = async (id: string | number) => {
			// Add friend
			let response = await addFriend(appState.user_id, user_id);
			if (!response.ok) {
				let log = await response.text();
				console.error(log);
			}
			toast.dismiss(id);

			// Remove the notification
			removeNotif(notif.id);

			// Add a new temporary notification for sucess message
			addTempNotif({
				id: "some-random-id",
				op_code: OpCode.OK,
				value: `Yeppy! @${user.username} is now your friend!`,
			});
		};

		const onReject = (id: string | number) => {
			toast.dismiss(id);

			// Remove the notification
			removeNotif(notif.id);
		};

		let tId = toast(
			<div>
				<div className="flex items-center justify-center space-x-4">
					<img
						src={pfp}
						className="w-[70px] h-[70px] rounded-[10px] m-[5px]"
					></img>
					<div className="flex flex-col">
						<p> @{user.username} sent you a friend request.</p>
						<div className="flex space-x-4">
							<Button onClick={() => onAccept(tId)}>
								{" "}
								<Check />{" "}
							</Button>
							<Button variant="destructive" onClick={() => onReject(tId)}>
								{" "}
								<X />{" "}
							</Button>
						</div>
					</div>
				</div>
			</div>,
			{
				duration: 5000,
			},
		);
	};

	return <></>;
};

export default NotificationSystem;
