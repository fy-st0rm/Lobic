// Node modules
import React, { FC, RefObject } from "react";

// Local
import { LobbyMembers } from "./LobblersArea";

// Assets
// TODO: Remove sadit and add a placeholder icon instead
import sadit from "/sadit.jpg";

export type Message = {
	user_id: string;
	message: string;
	timestamp: string;
};

type MessageAreaProps = {
	currentUserId: string;
	messages: Message[];
	users: LobbyMembers;
	chatContainerRef: RefObject<HTMLDivElement>;
};

export const MessageArea: FC<MessageAreaProps> = ({
	currentUserId,
	messages,
	users,
	chatContainerRef,
}): React.ReactElement => {
	return (
		<div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
			{" "}
			{messages?.map((msg, idx) => (
				<div
					key={idx}
					className={`flex mb-4 ${msg.user_id === currentUserId ? "justify-end" : "justify-start"}`}
				>
					<div className="relative flex items-end max-w-[60%]">
						{/* For incoming messages, show image on the left */}
						{msg.user_id !== currentUserId && (
							<img
								src={users[msg.user_id]?.pfp ? users[msg.user_id].pfp : sadit}
								alt="User"
								className="w-8 h-8 rounded-full object-cover mb-0.5 mr-1"
							/>
						)}
						{/* Message Box */}
						<div
							className={`px-4 py-2 rounded-2xl ${
								msg.user_id === currentUserId
									? "bg-green-100 rounded-br-none"
									: "bg-blue-50 rounded-bl-none"
							}`}
							style={{
								wordBreak: "break-word",
							}}
						>
							<p className="mb-1 mt-1">{msg.message}</p>
							<div className="text-xs text-gray-500">{msg.timestamp}</div>
						</div>

						{/* For outgoing messages, show image on the right*/}
						{msg.user_id === currentUserId && (
							<img
								src={users[msg.user_id]?.pfp ? users[msg.user_id].pfp : sadit}
								alt="User"
								className="w-8 h-8 rounded-full object-cover mb-0.5 ml-1"
							/>
						)}
					</div>
				</div>
			))}
		</div>
	);
};
