//InputArea.tsx
// Node modules
import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

type InputAreaProps = {
	inputValue: string;
	handleInputValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleEmojiClick: (emojiObject: { emoji: string }) => void;
	handleSendMsg: () => void;
	handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputArea: React.FC<InputAreaProps> = ({
	inputValue,
	handleInputValue,
	handleEmojiClick,
	handleSendMsg,
	handleFileSelect,
}): React.ReactElement => {
	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

	const toggleEmojiPicker = () => {
		setShowEmojiPicker(!showEmojiPicker);
	};

	return (
		<div className="px-4 py-3 bg-darker">
			<div className="relative flex items-center">
				<button
					onClick={toggleEmojiPicker}
					className="absolute left-3 text-gray-500 hover:text-gray-700 bg-transparent border-none"
				>
					<img src="/chats/emoji.svg" alt="Emoji" className="w-5 h-5" />
				</button>
				{showEmojiPicker && (
					<div className="absolute bottom-full left-0 mb-2">
						<EmojiPicker onEmojiClick={handleEmojiClick} />
					</div>
				)}
				<input
					type="text"
					placeholder="Type your message..."
					className="w-full pl-12 pr-12 py-2 rounded-full border border-black-300 focus:border-black-400 bg-secondary"
					value={inputValue}
					onChange={handleInputValue}
					onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
				/>
				<button
					onClick={() => {
						let fileInput = document.getElementById("fileInput");
						if (fileInput) fileInput.click();
					}}
					className="absolute right-3 text-gray-500 hover:text-gray-700 bg-transparent border-none"
				>
					<img src="/chats/images.svg" alt="Upload" className="w-5 h-5" />
				</button>
				<input
					id="fileInput"
					type="file"
					accept="image/*,application/pdf"
					className="hidden"
					multiple
					onChange={handleFileSelect}
				/>
			</div>
		</div>
	);
};
