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
			className="w-36 h-36 rounded-full object-cover"
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
		<div className="people-list flex gap-2 mx-7 my-3">
			{people.map((person: UserDataResponse) => (
				<div
					key={person.user_id}
					className="person-item flex flex-col gap-1 mb-4 p-3 hover:bg-opacity-50 hover:bg-secondary rounded-md"
				>
					<ProfilePicture
						imageUrl={profilePictures[person.user_id] || "/sadit.jpg"}
					/>
					<div className="text-center font-normal">{person.username && <span>{person.username}</span>}</div>
					
				</div>
			))}
		</div>
	);
};

export default PeopleList;
