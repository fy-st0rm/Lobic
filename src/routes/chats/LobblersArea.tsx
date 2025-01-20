// Node modules
import React from "react";

// Local
import { User } from "api/userApi";


export type LobbyMembers = {
	[id: string]: User;
};

type LobblersAreaProps = {
	users: LobbyMembers;
	selectedUser: User;
	handleUserClick: (user: User) => void;
};

export const LobblersArea: React.FC<LobblersAreaProps> = ({
	users, selectedUser, handleUserClick
}): React.ReactElement => {
	return (
		<div className="w-80 bg-black/60 rounded-lg overflow-hidden flex flex-col">
			<div className="p-4 bg-black/20">
				<span className="text-white font-bold text-xl">Lobblers</span>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="p-2 space-y-2">
					{
						Object.entries(users).map(([id, user]) => (
							<div
								key={id}
								onClick={() => handleUserClick(user)}
								className={
									`flex items-center p-3 rounded-lg cursor-pointer transition-colors
									${selectedUser?.id === user.id ? "bg-white/40" : "hover:bg-white/20"}`
								}
							>
								<img
									src={user.pfp}
									alt={user.username}
									className="w-10 h-10 rounded-full mr-3 object-cover"
								/>
								<span className="text-white font-medium">{user.username}</span>
							</div>
						))
					}
				</div>
			</div>
		</div>
	);
}

