// Node modules
import React, { FC, useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

// Local
import {
	Notification,
	useNotificationProvider,
} from "providers/NotificationProvider";
import { ImageFromUrl, getMusic } from "api/music/musicApi";
import { useQueueProvider } from "providers/QueueProvider";


type RequestedMusicProps = {
	notif: Notification,
	toastId: string | number,
};

const RequestedMusic: FC<RequestedMusicProps> = ({ notif, toastId }): React.ReactElement => {
	const { removeNotif } = useNotificationProvider();
	const { enqueue } = useQueueProvider();
	const music = notif.value;

	const onAccept = async () => {
		let track = await getMusic(music.id);
		if (track) enqueue(track);

		toast.dismiss(toastId);
		removeNotif(notif.id);
	}

	const onReject = () => {
		toast.dismiss(toastId);
		removeNotif(notif.id);
	}

	return (
		<>
			<div className="
					flex flex-col
					bg-secondary
					rounded-[13px] overflow-hidden p-2
				">
				<div className="flex items-center">
					<img
						src={ImageFromUrl(music.image_url)}
						className="w-[40px] h-[40px] rounded-[10px]"
					/>
					<div className="
						flex items-center
						text-primary_fg
						px-3 space-x-2
						overflow-x-auto no-scrollbar whitespace-nowrap
					">
						<div className="text-semibold text-xl">
							@{music.title}
						</div>
						<div className="text-secondary_fg opacity-70">
							is requested to be played.
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
		</>
	);
};

export default RequestedMusic;
