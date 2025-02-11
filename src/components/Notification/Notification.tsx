// Node modules
import React, { FC, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, Bird } from "lucide-react";

// Local
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import { useAppProvider } from "providers/AppProvider";
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import {
	fetchUserProfilePicture,
	getUserData,
	addFriend,
} from "@/api/user/userApi";

export const NotificationSystem = (): React.ReactElement => {
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
		toast(<div>{msg}</div>, {
			duration: 5000,
		});
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


export type NotifProps = {
	close: (event: MouseEvent) => void
};

export const NotificationDropDown: FC<NotifProps> = ({ close }): React.ReactElement => {
	const { notifs } = useNotificationProvider();
	const dropdown = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onMouseDown = (event: MouseEvent) => {
			if (!dropdown.current) return;
			if (!dropdown.current.contains(event.target as Node)) {
				close(event);
			}
		};

		document.addEventListener("mousedown", onMouseDown);

		return () => {
			document.removeEventListener("mousedown", onMouseDown);
		};
	}, []);

	return (
		<>
			<div
				ref={dropdown}
				className="
					absolute top-16 right-5
					w-80 h-[79%] z-50
					bg-secondary rounded-md
					flex flex-col
				"
			>
				<div className="
					text-bold text-2xl text-primary_fg p-5
				">
					Notifications
				</div>

				{Object.keys(notifs).length === 0 ? (
					// When notifications is empty
					<div className="flex flex-1 items-center justify-center">
						<div className="flex items-center justify-center">
							<Bird className="w-10 h-10 text-primary" />
							<div className="text-primary text-semibold text-xl p-3">
								It's quite out here...
							</div>
						</div>
					</div>
				) : (
					// Notifications
					<div className="px-5 overflow-y-auto whitespace-nowreap no-scrollbar">
						{Object.entries(notifs).map(([id, notif]) => (
							<div key={id} className="p-2 border-b border-gray-300">
								{JSON.stringify(notif)}
							</div>
						))}
					</div>
				)}

			</div>
		</>
	);
};
