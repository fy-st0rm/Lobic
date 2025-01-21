// Node modules
import React from "react";

// Local
import { AppProvider } from "providers/AppProvider";
import { LobbyProvider } from "providers/LobbyProvider";
import { MusicProvider } from "providers/MusicProvider";
import { SocketProvider } from "providers/SocketProvider";
import { QueueProvider } from "providers/QueueProvider";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	return (
		<AppProvider>
			<LobbyProvider>
				<MusicProvider>
					<SocketProvider>
						<QueueProvider>{children}</QueueProvider>
					</SocketProvider>
				</MusicProvider>
			</LobbyProvider>
		</AppProvider>
	);
};
