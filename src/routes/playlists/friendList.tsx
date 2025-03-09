import React, { useState } from "react";
import { Friend } from "@/api/friendApi";
import { fetchUserPfp } from "@/api/user/userApi";
import { addContributor } from "@/api/playlist/combinedPlaylistApi";

// Confirmation Popup Component
interface ConfirmationPopupProps {
	friendName: string;
	playlistName: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
	friendName,
	playlistName,
	onConfirm,
	onCancel,
}) => (
	<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
			<h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
			<p className="text-gray-700 mb-6">
				Do you want to add <span className="font-bold">{friendName}</span> as a
				contributor to <span className="font-bold">{playlistName}</span>?
			</p>
			<div className="flex justify-end gap-4">
				<button
					className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					className="px-4 py-2 bg-primary text-white rounded hover:bg-darker"
					onClick={onConfirm}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
);

// Friend List Component
interface AddContibutorFriendListProps {
	friends: Friend[];
	playlistId: string;
	playlistName: string;
	onContributorAdded: () => void; // Callback to refresh or notify parent
}

export const AddContibutorFriendList: React.FC<
	AddContibutorFriendListProps
> = ({ friends, playlistId, playlistName, onContributorAdded }) => {
	const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

	const handleFriendClick = (friend: Friend) => {
		setSelectedFriend(friend); // Show confirmation popup
	};

	const handleConfirm = async () => {
		if (!selectedFriend) return;

		const contributorData = {
			playlist_id: playlistId,
			contributor_user_id: selectedFriend.id,
		};

		try {
			await addContributor(contributorData);
			alert(`${selectedFriend.name} added as a contributor!`);
			onContributorAdded(); // Notify parent to refresh or update state
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "Failed to add contributor",
			);
		} finally {
			setSelectedFriend(null); // Close popup
		}
	};

	const handleCancel = () => {
		setSelectedFriend(null); // Close popup without action
	};

	return (
		<>
			<h2 className="text-xl font-bold mb-4">Add a Contributor</h2>
			<div className="flex flex-col gap-3">
				{friends.length > 0 ? (
					friends.map((friend) => (
						<div
							key={friend.id}
							className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
							onClick={() => handleFriendClick(friend)}
						>
							<img
								className="w-8 h-8 bg-gray-600 rounded-full"
								src={fetchUserPfp(friend.id)}
								alt={friend.name}
							/>
							<span className="text-white text-sm">{friend.name}</span>
						</div>
					))
				) : (
					<p className="text-gray-400 text-sm">No friends to display</p>
				)}
			</div>
			{selectedFriend && (
				<ConfirmationPopup
					friendName={selectedFriend.name}
					playlistName={playlistName}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</>
	);
};
