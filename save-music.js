// save-music.js
import fetch from "node-fetch";

async function saveMusicRequest() {
  try {
    const response = await fetch("http://127.0.0.1:8080/save_music", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "demo_songs/",
      }),
    });

    // Log the response status and headers for debugging
    console.log("Response Status:", response.status);
    console.log("Content-Type:", response.headers.get("content-type"));

    // Handle the response based on content type
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Success (JSON):", data);
    } else {
      // Handle text response
      const text = await response.text();
      console.log("Success (Text):", text);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Server running?  Error details:", {
      message: error.message,
      cause: error.cause,
    });
    process.exit(1);
  }
}

saveMusicRequest();
