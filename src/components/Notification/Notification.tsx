// Node modules
import React, { FC, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// Local
import { OpCode, wsSend, SocketResponse } from "api/socketApi";
import { useSocketProvider } from "providers/SocketProvider";
import { fetchUserProfilePicture, getUserData } from "api/userApi";

type Notification = {
	id: string;
	op_code: OpCode;
	value: any;
};

type Notifications = {
	[id: string]: Notification;
};

const NotificationSystem = (): React.ReactElement => {
	const { addMsgHandler } = useSocketProvider();
	const { getSocket } = useSocketProvider();

	const [notifs, setNotifs] = useState<Notifications>({} as Notifications);

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

	useEffect(() => {
		// Showing the notification
		Object.entries(notifs).map(async ([id, notif]) => {
			if (notif.op_code === OpCode.ADD_FRIEND) {
				let user_id = notif.value;

				let user = await getUserData(user_id);
				let pfp = await fetchUserProfilePicture(user_id);

				const onAccept = (id: string | number) => {
					// TODO: Add friend
					toast.dismiss(id);
				};

				const onReject = (id: string | number) => {
					// TODO: Remove from notification
					toast.dismiss(id);
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
						duration: 3000,
					},
				);
			}
		});
	}, [notifs]);

	const dummy = () => {
		let notif: Notification = {
			id: "asd",
			op_code: OpCode.ADD_FRIEND,
			value: "0ee42983-05c2-40ff-a829-371c02607100",
		};
		console.log(notif);
		setNotifs((prevNotifs) => ({
			...prevNotifs,
			[notif.id]: notif,
		}));
	};

	return (
		<>
			<Button variant="destructive" onClick={dummy}>
				dummy notif pls ignore it woks btw
			</Button>
		</>
	);
};

export default NotificationSystem;
