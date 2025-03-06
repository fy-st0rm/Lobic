// Node modules
import React, { FC, useState, useEffect, useRef } from "react";
import { Bird } from "lucide-react";

// Local
import { OpCode } from "api/socketApi";
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import AddFriend from "./AddFriend";
import RequestedMusic from "./RequestedMusic";

/*
 * Notification Dropdown Component
 */

export type NotifProps = {
	isOpen: boolean,
	close: (event: MouseEvent) => void
};

const getNotifUI = (id: string, notif: Notification): React.ReactElement => {
	if (notif.op_code === OpCode.ADD_FRIEND) {
		return (
			<div key={id} className="p-2 border-b border-gray-300">
				<AddFriend notif={notif} toastId={""}/>
			</div>
		);
	}
	else if (notif.op_code === OpCode.REQUEST_MUSIC_PLAY) {
		return (
			<div key={id} className="p-2 border-b border-gray-300">
				<RequestedMusic notif={notif} toastId={""}/>
			</div>
		);
	}
	else {
		return (<></>);
	}
}

export const NotificationDropDown: FC<NotifProps> = ({ isOpen, close }): React.ReactElement => {
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
				className={`
					absolute top-16 right-5
					w-96 z-50
					bg-secondary rounded-md
					flex flex-col
					transition-all duration-300 ease-in-out
					${isOpen ? "h-[79%] opacity-100" : "h-0 opacity-0"}
				`}
			>
				<div className={`
					text-bold text-2xl text-primary_fg p-5
					${isOpen ? "" : "hidden"}`}
				>
					Notifications
				</div>

				{Object.keys(notifs).length === 0 ? (
					// When notifications is empty
					<div className={`flex flex-1 items-center justify-center ${isOpen ? "" : "hidden"}`}>
						<div className="flex items-center justify-center">
							<Bird className="w-10 h-10 text-primary" />
							<div className="text-primary text-semibold text-xl p-3">
								It's quite out here...
							</div>
						</div>
					</div>
				) : (
					// Notifications
					<div className="overflow-y-auto whitespace-nowreap no-scrollbar">
						{Object.entries(notifs).map(([id, notif]) => (
							getNotifUI(id, notif)
						))}
					</div>
				)}

			</div>
		</>
	);
};
