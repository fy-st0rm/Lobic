import React, {useState} from 'react'

function NavBar() {
    const [showMessage, setShowMessage] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [inputValue, setInput] = useState("");
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowMessage(true);
    setIsDisabled(true);
  };

  const handleConfirm = () => {
    setShowMessage(false);
    setIsDisabled(false);
    alert("You have logged out successfully.");
  };

  const handleCancel = () => {
    setShowMessage(false);
    setIsDisabled(false);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleClearButton = () => {
    setInput("");
  };

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
  };

  const closeDashboard = () => {
    setIsDashboardOpen(false);
  };

  const navigateAndClose = (url) => {
    closeDashboard();
    window.location.href = url;
  };

  return (
    <>
      <div className="navbar">
        <div className="logo-container">
          <a href="/home" className={isDisabled ? "disabled-link" : ""}>
            <img src="./public/lobic_logo.png" className="logo" alt="Logo" />
          </a>
        </div>

        <ul className="navbar-items">
          <li>
            <a
              href="/home"
              className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
            >
              <img
                className="navbar-icons"
                src="./public/home.png"
                alt="Home Icon"
              />
            </a>
          </li>
          <li>
            <a
              href="/friends"
              className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
            >
              <img
                className="navbar-icons"
                src="./public/people.png"
                alt="Friends Icon"
              />
            </a>
          </li>
          <li>
            <a
              href="/playlists"
              className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
            >
              <img
                className="navbar-icons"
                src="./public/playlist.png"
                alt="Playlist Icon"
              />
            </a>
          </li>
          <li>
            <a
              href="/notifications"
              className={`navbar-link ${isDisabled ? "disabled-link" : ""}`}
            >
              <img
                className="navbar-icons"
                src="./public/bell.png"
                alt="Notifications Icon"
              />
            </a>
          </li>
        </ul>

        <div className="searchbar-container">
          <input
            type="text"
            placeholder="Search for your music"
            className="search-bar"
            disabled={isDisabled}
            style={{ pointerEvents: isDisabled ? "none" : "auto" }}
            value={inputValue}
            onChange={handleInputChange}
          />
          <button className="clear-button">
            <img
              src="./public/close.png"
              className="clear-png"
              onClick={handleClearButton}
              alt="Clear Button"
            />
          </button>
        </div>

        <div className="user-icon">
          <button className="profile-button">
            <img src="/public/sadit.jpg" className="profile-pic" alt="Profile" />
          </button>
        </div>

        <div className="logout">
          <button
            className="logout-button"
            onClick={handleLogoutClick}
            disabled={isDisabled}
            style={{ pointerEvents: isDisabled ? "none" : "auto" }}
          >
            <img
              className="navbar-button"
              src="./public/logout.png"
              alt="Logout"
            />
          </button>
        </div>

        <div className="hamburger">
          <button
            className="hamburger-button"
            style={{ pointerEvents: isDisabled ? "none" : "auto" }}
            onClick={toggleDashboard}
          >
            <img
              src="./public/hamburger.png"
              className="hamburger-icon"
              alt="Hamburger"
            />
          </button>
        </div>

        {isDashboardOpen && (
          <>
            <div className="overlay" onClick={closeDashboard}></div>
            <div className="dashboard open">
              <div className="dashboard-content">
                <h2>Dashboard</h2>
                <button onClick={() => navigateAndClose("/home")}>Home</button>
                <button onClick={() => navigateAndClose("/playlists")}>
                  Playlists
                </button>
                <button onClick={() => navigateAndClose("/notifications")}>
                  Notifications
                </button>
                <button onClick={() => navigateAndClose("/friends")}>
                  Friends
                </button>
                <button onClick={() => navigateAndClose("/profile")}>
                  Profile
                </button>
                <button onCLick={() => navigateAndClose("/logout")}>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showMessage && (
        <div className="floating-message">
          <p>Are you sure you want to logout?</p>
          <div className="button-group">
            <button className="confirm-button" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
