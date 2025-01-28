interface SongInfoProps {
	songName: string;
	artistName: string;
	duration: string;
	addedBy: string;
	image_url: string;
}

const SongInfo: React.FC<SongInfoProps> = ({
	songName,
	artistName,
	duration,
	addedBy,
	image_url,
}) => {
	return (
		<div className="flex justify-evenly items-center mt-0 mx-2">
			<div className="flex items-center gap-0 font-bold w-[40%] px-4 py-[2px]">
				<div className="cover h-[66px] w-[66px] py-1 self-start cursor-pointer">
					<img
						src={image_url}
						alt=""
						className="h-[66px] w-[66px] cover rounded"
					/>
				</div>
				<div className="self-start mt-5 ml-5">
					<div className="font-sans text-[100%] text-white overflow-hidden">
						{songName}
					</div>
					<div className="font-sans text-[50%] text-white opacity-65 text-nowrap overflow-hidden">
						{artistName}
					</div>
				</div>
			</div>
			<div className="font-sans text-[70%] text-white font-bold duration w-[30%] px-4 py-2">
				{duration}
			</div>
			<div className="font-sans text-[70%] text-white font-bold addedby w-[20%] px-4 py-2 overflow-hidden text-nowrap">
				{addedBy}
			</div>
		</div>
	);
};

export default SongInfo;
