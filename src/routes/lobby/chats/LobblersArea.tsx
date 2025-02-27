// LobblersArea.tsx
import React from "react";
import { User } from "@/api/user/userApi";
import Lobby from "/sidebar/Lobby.svg";

export type LobbyMembers = {
  [id: string]: User;
};

type LobblersAreaProps = {
  users: LobbyMembers;
  selectedUser: User;
  handleUserClick: (user: User) => void;
  isExtended: boolean;
};

export const LobblersArea: React.FC<LobblersAreaProps> = ({
  users,
  selectedUser,
  handleUserClick,
  isExtended,
}): React.ReactElement => {
  return (
    <div className="h-full bg-secondary rounded-lg overflow-hidden flex flex-col">
      {/* Header - Full "Lobblers" text when sidebar is collapsed, just "L" when extended */}
      <div className="p-4 bg-darker flex items-center">
        {!isExtended ? (
          <span className="text-white font-bold text-xl">Lobblers</span>
        ) : (
          <div className="w-full flex justify-center">
            <img src={Lobby} alt="Lobby Icon" className="w-8 h-8" />
          </div>
        )}
      </div>
      
      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-2 ${isExtended ? 'flex flex-col items-center space-y-4' : 'space-y-2'}`}>
          {Object.entries(users).map(([id, user]) => (
            <div
              key={id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center rounded-lg cursor-pointer transition-colors
                ${selectedUser?.id === user.id ? "bg-white/40" : "hover:bg-white/20"}
                ${isExtended ? 'p-2 justify-center w-12 h-12' : 'p-3'}`}
            >
              <img
                src={user.pfp}
                alt={user.username}
                className={`rounded-full object-cover ${isExtended ? 'w-8 h-8' : 'w-10 h-10'}`}
              />
              {!isExtended && (
                <span className="text-white font-medium ml-3">{user.username}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};