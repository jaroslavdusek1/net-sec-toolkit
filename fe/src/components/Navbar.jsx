import React, { useEffect, useState } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import AlertModal from '../components/AlertModal.jsx';
import { isServerUp } from '../api/isServerUp.ts';

export default function Navbar() {
  const [isToggled, setIsToggled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const savedServerStatus = localStorage.getItem('serverStatus');
    setIsToggled(savedServerStatus === 'true');
  }, []);

  // Call API and set switch's state
  const handleSkullClick = async (event) => {
    event.preventDefault();
    setShowModal(true);
    setAlertMessage('Checking server status...');
    try {
      const message = await isServerUp();
      const isUp = message.includes("yo, server is UP - running port 8080");

      setIsToggled(isUp);
      localStorage.setItem('serverStatus', isUp); // Save in the locale storage

      setAlertMessage(message);
    } catch (error) {
      setIsToggled(false);
      localStorage.setItem('serverStatus', false);
      setAlertMessage(`nope, server is down, mate`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <nav className="nav">

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, minWidth: 'max-content' }} className="logo-and-switch">
          {/* Skull - Logo */}
          <Link to="/home" onClick={handleSkullClick}>
            <img src="/skull.png" alt="banik pico" className="site-logo" />
          </Link>

          {/* Toggle Switch - Server UP/DOWN */}
          <label className="switch">
            <input
              type="checkbox"
              id="toggleSwitch"
              checked={isToggled}
              onChange={() => { }}
              disabled // not clickable
            />
            <span className="slider round"></span>
            {/* Sparks rendering */}
            {isToggled && (
              <div className="sparks">
                <div className="spark-up"></div>
                <div className="spark-up1"></div>
                <div className="spark-down"></div>
              </div>
            )}
          </label>

          <div style={{ display: 'flex' }}>
            <span className="quote">v: 1.0.0</span>
          </div>

          {/* Server Status */}
          <div className="server-status">
            {isToggled ? 'Server is UP - running on port 8080' : 'Server is OFF'}
          </div>
        </div>

      </div>



      <ul>
        <CustomLink to='/home'>home</CustomLink>
        <CustomLink to='/term'>term</CustomLink>
        <CustomLink to='/SYNflood'>syn flood <span role="img" aria-label="skull">💀</span></CustomLink>
        <CustomLink to='/rHash'>reverse hash <span role="img" aria-label="skull">💀</span></CustomLink>
        <CustomLink to='/SSHattack'>SSH attack <span role="img" aria-label="skull">💀</span></CustomLink>
        <CustomLink to='/brute_force_check'>brute force check</CustomLink>
        <CustomLink to='/top'>top</CustomLink>
        <CustomLink to='/catchMe'>catch me</CustomLink>
        <CustomLink to='/bBinary'>buffet binary</CustomLink>
        {/* <CustomLink to='/about'>about</CustomLink> */}
        <CustomLink to='/sniff' >sniff</CustomLink>
        <CustomLink to='/deauth'>deauth</CustomLink>
      </ul>

      {showModal && (
        <AlertModal
          title="Server Status"
          message={alertMessage}
          onClose={handleCloseModal}
        />
      )}
    </nav>
  );

}

/**
 * CustomLink is a component that extends the functionality of the Link component from React Router.
 * This component determines if the link's path matches the current route and, if so,
 * adds an 'active' class, which allows for visual highlighting of the active link.
 *
 * @param {object} props - Properties passed to the CustomLink component.
 * @param {string} props.to - The path that the link should navigate to.
 * @param {React.ReactNode} props.children - The content to be displayed inside the link.
 * @returns {React.Component} A Link component with an 'active' class added if the path matches.
 */
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}
