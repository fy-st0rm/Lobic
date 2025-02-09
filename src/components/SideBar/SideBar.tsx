import { Link } from "react-router-dom";
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

    return (

        <div className={`h-[80vh] md:h-[74vh] 2xl:h-[80vh] transition-all bg-secondary absolute top-[90px] my-5 mx-2 overflow-hidden rounded-lg overflow ${isExtended ? 'w-[12vw]' : 'w-[65px]'}`}>
            <div className="flex flex-col px-2 py-5">
                <Link
                    to="/home" className="no-underline text-primary_fg">
                    <div className={`p-2 py-1 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md ${isExtended ? 'flex gap-3 items-center' : 'flex gap-0'}`}>
                        <div>
                            <img
                                className="navbar-home h-8 w-8"
                                src={Home}
                                alt="Home Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Home</div>
                    </div>
                </Link>
                <Link
                    to="/lobby"
                    className="no-underline text-primary_fg"
                >
                    <div className="flex gap-3 items-center p-2 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md pb-1 my-1">
                        <div>
                            <img
                                className="navbar-icons h-8 w-8"
                                src={Lobby}
                                alt="Friends Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Lobby</div>
                    </div>
                </Link>
                <Link
                    to="/playlists"
                    className="no-underline text-primary_fg"
                >
                    <div className="flex gap-3 items-center p-2 pb-0 mb-2 hover:bg-[#D9D9D9] hover:bg-opacity-10 rounded-md">
                        <div className="h-10 w-8">
                            <img
                                className="navbar-icons h-9 w-8"
                                src={Playlist}
                                alt="Playlist Icon"
                            />
                        </div>
                        <div className={`font-bold text-sm overflow-hidden transition-all ${isExtended ? '' : 'w-0'}`}>Playlists</div>
                    </div>
                </Link>
            </div>
            <div
                onClick={() => {
                    toggleSidebar();
                }}
                className="absolute bottom-0 right-3 py-4 px-3 transition-all"
            >
                <img src={isExtended ? toggleMinimise : toggleExtend} alt="Toggle sidebar" />
            </div>
        </div>
        
    );
}

export default SideBar;
