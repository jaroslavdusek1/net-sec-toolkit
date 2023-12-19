// import React, { useState } from 'react';

// const FullScreenDiagnose = () => {
//     const [showImage, setShowImage] = useState(false);
//     const [playSiren, setPlaySiren] = useState(false);

//     const handleButtonClick = () => {
//         const elem = document.documentElement;

//         if (elem.requestFullscreen) {
//             elem.requestFullscreen().then(() => {
//                 setShowImage(true);

//                 // Přehrání zvuku siren
//                 const audio = new Audio('../../src/nuke_alert.mp3');
//                 audio.play().then(() => {
//                     setPlaySiren(true);
//                 });
//             });
//         }
//     };

//     return (
//         <div>
//             <button onClick={handleButtonClick}>Zobrazit Diagnózu</button>
//             {showImage && (
//                 <img
//                     src="https://malwaretips.com/blogs/wp-content/uploads/2014/11/warning-your-computer-may-be-infected-virus.jpg"
//                     alt="Diagnóza"
//                     style={{
//                         position: 'fixed',
//                         top: 0,
//                         left: 0,
//                         width: '100vw',
//                         height: '100vh',
//                         objectFit: 'contain',
//                         backgroundColor: 'white',
//                     }}
//                 />
//             )}
//             {playSiren && (
//                 <audio
//                     src="../../src/nuke_alert.mp3"
//                     autoPlay
//                     loop
//                 >
//                     Your browser does not support the audio element.
//                 </audio>
//             )}
//         </div>
//     );
// };

// export default FullScreenDiagnose;
