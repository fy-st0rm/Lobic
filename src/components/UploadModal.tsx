import React, { ChangeEvent } from "react";

interface UploadModalProps {
	showModal: boolean; // Controls visibility of the modal
	onClose: () => void; // Callback to close the modal
	onFileChange: (e: ChangeEvent<HTMLInputElement>) => void; // Callback for file selection
	onUpload: () => void; // Callback to handle upload action
	isUpdating: boolean; // Indicates if upload is in progress
	title?: string; // Optional custom title for flexibility (e.g., "Upload Playlist Cover")
}

const UploadModal: React.FC<UploadModalProps> = ({
	showModal,
	onClose,
	onFileChange,
	onUpload,
	isUpdating,
	title = "Upload Profile Picture", // Default title
}) => {
	if (!showModal) return null; // Render nothing if modal is not shown

	return (
		<div className="fixed top-0 left-0 w-full h-full bg-primary bg-opacity-80 flex justify-center items-center z-50">
			<div className="bg-secondary bg-opacity-98 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
				<h2 className="text-2xl font-semibold text-white mb-6">{title}</h2>
				<input
					type="file"
					accept="image/*"
					onChange={onFileChange}
					className="mb-6 text-gray-300"
				/>
				<div className="flex justify-center space-x-4">
					<button
						className="bg-button hover:bg-button_hover text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
						onClick={onUpload}
						disabled={isUpdating}
					>
						{isUpdating ? "Uploading..." : "Upload"}
					</button>
					<button
						className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:scale-105"
						onClick={onClose}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default UploadModal;
