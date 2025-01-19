// Node modules
import React from "react";

// Local
import { AppProvider } from "providers/AppProvider.tsx";
import { LobbyProvider } from "providers/LobbyProvider.tsx";
import { MusicProvider } from "providers/MusicProvider.tsx";
import { SocketProvider } from "providers/SocketProvider.tsx";


export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
	return (
		<AppProvider>
			<LobbyProvider>
				<MusicProvider>
					<SocketProvider>
						{children}
					</SocketProvider>
				</MusicProvider>
			</LobbyProvider>
		</AppProvider>
	);
}
