import { UserDataResponse } from "@/api/searchApi";
import { fetchUserProfilePicture, User } from "@/api/user/userApi";
import React, { useEffect, useState } from "react";

const ProfilePicture: React.FC<{
	imageUrl: string;
}> = ({ imageUrl }) => (
	<div className="relative">
		<img
			src={imageUrl}
			alt="User Profile"
			className="w-[100px] h-[100px] rounded-full object-cover"
		/>
	</div>
);

const PeopleList: React.FC<{ people: UserDataResponse[] }> = ({ people }) => {
	const [profilePictures, setProfilePictures] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		const fetchProfilePictures = async () => {
			const picturePromises = people.map(async (person: UserDataResponse) => {
				try {
					const imageUrl = await fetchUserProfilePicture(person.user_id);
					return { user_uuid: person.user_id, imageUrl };
				} catch (error) {
					console.error(
						`Failed to fetch profile picture for ${person.user_id}:`,
						error,
					);
					return { user_uuid: person.user_id, imageUrl: "/sadit.jpg" };
				}
			});

			const results = await Promise.all(picturePromises);
			const newPictures = results.reduce(
				(acc, { user_uuid, imageUrl }) => ({
					...acc,
					[user_uuid]: imageUrl,
				}),
				{},
			);
			setProfilePictures(newPictures);
		};
		fetchProfilePictures();
	}, [people]);

	return (
		<div className="people-list">
			{people.map((person: UserDataResponse) => (
				<div
					key={person.user_id}
					className="person-item flex items-center gap-4 mb-4"
				>
					<ProfilePicture
						imageUrl={profilePictures[person.user_id] || "/sadit.jpg"}
					/>
					{person.username && <span>{person.username}</span>}
				</div>
			))}
		</div>
	);
};

export default PeopleList;
