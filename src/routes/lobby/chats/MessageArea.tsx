//MessageArea.tsx
// Node modules
import React, { FC, RefObject } from "react";

// Local
import { LobbyMembers } from "./LobblersArea";


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
		<div className="flex-1 overflow-y-auto p-4 bg-secondary" ref={chatContainerRef}>
	{messages?.map((msg, idx) => (
		<div
			key={idx}
			className={`flex mb-4 ${msg.user_id === currentUserId ? "justify-end" : "justify-start"}`}
		>
			{/* Message Container */}
			<div className="flex items-end max-w-[70%]">
				{/* Incoming Message: Profile picture on the left */}
				{msg.user_id !== currentUserId && (
					<img
						src={users[msg.user_id]?.pfp ? users[msg.user_id].pfp : ''}
						alt="User"
						className="w-9 h-9 rounded-full object-cover "
					/>
				)}

				{/* Message Bubble */}
				<div>
					<div
						className={`px-4 py-2 rounded-3xl ${
							msg.user_id === currentUserId
								? "bg-[#2C6377] text-white"
								: "bg-white text-black"
						}`}
						style={{
							wordBreak: "break-word",
							boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
							fontSize: "16px", // Match font size as in the image
						}}
					>
						<p>{msg.message}</p>
					</div>

					{/* Timestamp */}
					<div
						className={`text-xs mt-1 mx-2 ${
							msg.user_id === currentUserId ? "text-right text-gray-400" : "text-left text-gray-500"
						}`}
					>
						{msg.timestamp}
					</div>
				</div>

				{/* Outgoing Message: Profile picture on the right */}
				{msg.user_id === currentUserId && (
					<img
						src={users[msg.user_id]?.pfp ? users[msg.user_id].pfp : ''}
						alt="User"
						className="w-9 h-9 rounded-full object-cover ml-3"
					/>
				)}
			</div>
		</div>
	))}
</div>



	);
};
