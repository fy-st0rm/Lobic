import { Link, useLocation } from "react-router-dom";
import React, {
	useState,
	createContext,
	useContext,
	useEffect,
	PropsWithChildren,
} from "react";

import Home from "/sidebar/Home.svg";
import Lobby from "/sidebar/Lobby.svg";
import Playlist from "/sidebar/playlist.svg";
import toggleMinimise from "/sidebar/toggleMinimize.svg";
import toggleExtend from "/sidebar/toggleExtend.svg";
import { useLobbyProvider } from "@/providers/LobbyProvider";

type SidebarContextType = {
	isExtended: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [isExtended, setIsExtended] = useState(() => {
		const savedState = localStorage.getItem("isExtended");
		return savedState !== null ? JSON.parse(savedState) : true;
	});

	useEffect(() => {
		localStorage.setItem("isExtended", JSON.stringify(isExtended));
	}, [isExtended]);

	const toggleSidebar = () => setIsExtended((prev: any) => !prev);

	return (
		<SidebarContext.Provider value={{ isExtended, toggleSidebar }}>
			{children}
		</SidebarContext.Provider>
	);
};

export const useSidebarState = () => {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebarState must be used within a SidebarProvider");
	}
	return context;
};

interface NavItemProps {
	to: string;
	icon: string;
	alt: string;
	label: string;
	isExtended: boolean;
}
const NavItem = ({ to, icon, alt, label, isExtended }: NavItemProps) => {
	const { lobbyState } = useLobbyProvider();
	const location = useLocation();
	const isActive = location.pathname === to;

	const activeIndicatorClass = `h-1.5 w-1.5 bg-[#9BB9FF] rounded-full ${isExtended ? "" : "absolute"}`;

	return (
		<Link to={to} className="no-underline text-primary_fg">
			<div
				className={`p-2 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md ${
					isExtended ? "flex gap-3 items-center" : "flex gap-0"
				}`}
			>
				<img className={`navbar-icons h-8 w-8`} src={icon} alt={alt} />
				<div
					className={`font-bold text-sm overflow-hidden transition-all ${
						isExtended ? "" : "w-0"
					}`}
				>
					{label}
				</div>
				{isActive && <div className={activeIndicatorClass}></div>}
				{lobbyState.in_lobby && label === "Lobby" && (
					<div
						className={`h-1.5 w-1.5 bg-[#26f726] rounded-full ${isExtended ? "" : "absolute"}`}
					></div>
				)}
			</div>
		</Link>
	);
};

// Main SideBar component
function SideBar() {
	const { isExtended, toggleSidebar } = useSidebarState();

	// Navigation items configuration
	const navItems = [
		{ to: "/home", icon: Home, alt: "Home Icon", label: "Home" },
		{ to: "/lobby", icon: Lobby, alt: "Friends Icon", label: "Lobby" },
		{
			to: "/playlists",
			icon: Playlist,
			alt: "Playlist Icon",
			label: "Playlists",
		},
	];

	return (
		<div
			className={`transition-all flex flex-col justify-between bg-secondary mx-2 overflow-hidden rounded-lg flex-shrink-0 ${
				isExtended ? "w-[250px]" : "w-[65px]"
			}`}
			style={{ minWidth: isExtended ? "250px" : "65px" }}
		>
			<div className="flex flex-col px-2 py-5 gap-2">
				{navItems.map((item) => (
					<NavItem
						key={item.to}
						to={item.to}
						icon={item.icon}
						alt={item.alt}
						label={item.label}
						isExtended={isExtended}
					/>
				))}
			</div>
			<div
				onClick={toggleSidebar}
				className="flex py-4 px-3 transition-all mx-2 cursor-pointer"
			>
				<img
					src={isExtended ? toggleMinimise : toggleExtend}
					alt="Toggle sidebar"
					className="ml-auto"
				/>
			</div>
		</div>
	);
}

export default SideBar;
