// Node modules
import React from "react";

// Local
import { AppProvider } from "providers/AppProvider";
import { LobbyProvider } from "providers/LobbyProvider";
import { MusicProvider } from "providers/MusicProvider";
import { SocketProvider } from "providers/SocketProvider";
import { QueueProvider } from "providers/QueueProvider";
import { NotificationProvider } from "providers/NotificationProvider";
import { QueueStateProvider } from "@/components/Queue/queue";
import { SidebarProvider } from "@/components/SideBar/SideBar";
import { MusicListsProvider } from "./MusicListContextProvider";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
	children,
}): React.ReactElement => {
	return (
		<AppProvider>
			<LobbyProvider>
				<MusicProvider>
					<SocketProvider>
						<QueueProvider>
							<NotificationProvider>
								<QueueStateProvider>
									<SidebarProvider>
										<MusicListsProvider>
											{children}
										</MusicListsProvider>
									</SidebarProvider>
								</QueueStateProvider>
							</NotificationProvider>
						</QueueProvider>
					</SocketProvider>
				</MusicProvider>
			</LobbyProvider>
		</AppProvider>
	);
};
