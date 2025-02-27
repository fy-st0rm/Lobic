
import React, {
    useState,
    createContext,
    useRef,
    useEffect,
    PropsWithChildren,
} from "react";

import { useQueueProvider } from "providers/QueueProvider";
import { ImageFromUrl, MPState, MusicTrack } from "@/api/music/musicApi";
import { useMusicProvider, MusicState } from "@/providers/MusicProvider";
import { AudioVisualizer } from 'react-audio-visualize';



function Queue() {

    const [isVisible, setIsVisible] = useState<boolean>(true);
    const { queue } = useQueueProvider();
    const { musicState } = useMusicProvider();
    const visualizerRef = useRef<HTMLCanvasElement>(null);
    const [heights, setHeights] = useState([5, 4, 2]);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeights(heights.map(() => Math.floor(Math.random() * 7) + 1));
        }, 100);

        return () => clearInterval(interval);
    }, [heights]);

    return (
        <>

            <div
                className={`transition-all justify-between bg-secondary mx-2 overflow-hidden rounded-lg flex-shrink-0 w-[400px] ${isVisible ? "" : "h-0 hidden"
                    }`}
            >
                <div>
                    <div className="p-2 mx-3 my-2 mt-4 text-lg text-primary_fg font-bold"> Currently Playing</div>
                    <div className="">
                        <div className="flex items-center justify-between font-bold px-6 pb-2 transition-all">
                            <div className="h-[50px] w-[50px] self-start rounded-sm">
                                <img
                                    src={
                                        musicState?.image_url
                                            ? ImageFromUrl(musicState.image_url) : ''

                                    }
                                    alt="Album cover"
                                    className="h-[100%] w-[100%] rounded-sm"
                                />
                            </div>

                            <div className="mx-2 grow">
                                <div className=" text-sm font-bold text-vivid  overflow-hidden">
                                    {musicState?.title || "No Song Selected"}
                                </div>
                                <div className=" text-sm font-semibold  text-white opacity-40 text-nowrap overflow-hidden">
                                    {musicState?.artist || ""}
                                </div>
                            </div>
                         
                            <div className={musicState.state == MPState.PAUSE ? "hidden":'items-center flex gap-1 h-7 justify-cente p-2 rounded-md'}>
                                    {heights.map((height, index) => (
                                        <div
                                            key={index}
                                            className={`w-1 rounded-lg bg-vivid transition-all duration-300`}
                                            style={{ height: `${height * 4}px` }}
                                        ></div>
                                    ))}
                            </div>
                           

                        </div>
                    </div>
                </div>

                <div className="">
                    <div className="p-2 mx-3 text-lg text-primary_fg font-bold "> Queue
                        <div className="w-10 h-1 rounded-lg relative bg-vivid left-2"></div>
                    </div>
                    {queue.map((item) => (
                        <div className="flex items-center font-bold px-6 pb-2 my-2 transition-all">
                            <div className="h-[50px] w-[50px] self-start rounded-sm">
                                <img
                                    src={ImageFromUrl(item.image_url)}
                                    alt="Album cover"
                                    className="h-[100%] w-[100%] rounded-sm"
                                />
                            </div>
                            <div className="mx-2">
                                <div className="text-sm font-bold text-primary_fg  overflow-hidden">
                                    {item.title}
                                </div>
                                <div className="text-sm font-normal  text-white opacity-40 text-nowrap overflow-hidden">
                                    {item.artist}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </>
    );
}
export default Queue;
