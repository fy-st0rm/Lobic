import { Link, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext, useEffect, PropsWithChildren } from 'react';

import Home from '/sidebar/Home.svg';
import Lobby from '/sidebar/Lobby.svg';
import Playlist from '/sidebar/playlist.svg';
import toggleMinimise from '/sidebar/toggleMinimize.svg';
import toggleExtend from '/sidebar/toggleExtend.svg';

type SidebarContextType = {
    isExtended: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isExtended, setIsExtended] = useState(() => {
        const savedState = localStorage.getItem('isExtended');
        return savedState !== null ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        localStorage.setItem('isExtended', JSON.stringify(isExtended));
    }, [isExtended]);

    const toggleSidebar = () => {
        setIsExtended((prev: any) => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isExtended, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebarState = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarState must be used within a SidebarProvider');
    }
    return context;
};

function SideBar() {
    const { isExtended, toggleSidebar } = useSidebarState();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const getLinkStyles = (path: string) => {
        const activeStyles = "h-1.5 w-1.5 bg-[#7B92C9] rounded-full ";
        return ` ${isActive(path) ? activeStyles : ''}`;
    };

    return (
        <div className={`transition-all flex flex-col justify-between bg-secondary mx-2 overflow-hidden rounded-lg overflow flex-shrink-0 ${isExtended ? 'w-[250px]' : 'w-[65px]'}`}>
            <div className="flex flex-col px-2 py-5 gap-2">
                <Link
                    to="/home" 
                    className="no-underline text-primary_fg"
                >
                    <div className={`p-2 py-1 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md ${isExtended ? 'flex gap-3 items-center' : 'flex gap-0'}`}>
                        <div>
                            <img
                                className="navbar-home h-8 w-8"
                                src={Home}
                                alt="Home Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Home</div>
                        <div className={getLinkStyles('/home')}></div>
                    </div>
                </Link>
                <Link
                    to="/lobby"
                    className="no-underline text-primary_fg"
                >
                    <div className={`p-2 py-1 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md ${isExtended ? 'flex gap-3 items-center' : 'flex gap-0'}`}>
                        <div>
                            <img
                                className="navbar-icons h-8 w-8"
                                src={Lobby}
                                alt="Friends Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Lobby</div>
                        <div className={`relative ${getLinkStyles('/lobby')}`}></div>
                    </div>
                </Link>
                <Link
                    to="/playlists"
                    className="no-underline text-primary_fg"
                >
                    <div className={`p-2 py-1 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md ${isExtended ? 'flex gap-3 items-center' : 'flex gap-0'}`}>
                        <div className="h-10 w-8">
                            <img
                                className="navbar-icons h-9 w-8"
                                src={Playlist}
                                alt="Playlist Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Playlists</div>
                        <div className={getLinkStyles('/playlists')}></div>
                    </div>
                </Link>
            </div>
            <div
                onClick={toggleSidebar}
                className="flex py-4 px-3 transition-all mx-2"
            >
                <img src={isExtended ? toggleMinimise : toggleExtend} alt="Toggle sidebar" className="ml-auto"/>
            </div>
        </div>
    );
}

export default SideBar;