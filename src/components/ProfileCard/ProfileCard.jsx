import React from "react";
import Image from "/public/pic_test_2.png";
import "./ProfileCard.css";

import { SERVER_IP } from "../../const";

function ProfileCard({ usertag, username, friendcount, user_uuid }) {
  // console.log(user_uuid); we got user_uuid in here
  const handleUpload = async () => {
    try {
      const response = await fetch(Image); // TODO: get from the backend or the user input (idk)
      const blob = await response.blob();

      // Send the image data as raw bytes in the request body
      const uploadResponse = await fetch(
        `${SERVER_IP}/user/update_pfp?user_uuid=${user_uuid}`,
        {
          method: "POST",
          body: blob,
          headers: {
            "Content-Type": "image/png",
          },
        }
      );

      if (uploadResponse.ok) {
        const data = await uploadResponse.text();
        console.log("Upload successful:", data);
      } else {
        console.error("Upload failed:", uploadResponse.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="info-container">
      <div className="profile-pic-container">
        <img src={Image} alt="User Profile" className="user-pic" />
      </div>
      <div className="user-details-container">
        <h4>{usertag}</h4>
        <h2>{username}</h2>
        <h3>{friendcount}</h3>
      </div>
      <button className="upload-btn" onClick={handleUpload}>
        Update Profile Picture
      </button>
    </div>
  );
}

export default ProfileCard;
