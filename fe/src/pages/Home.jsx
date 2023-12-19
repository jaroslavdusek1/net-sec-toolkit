import React, { useState } from 'react';

const RandomHttpStatusCat = () => {
    const [imageUrl, setImageUrl] = useState('');
    const availableStatusCodes = [100, 101, 200, 201, 202, 204, 206, 207, 300, 301, 302, 303, 304, 305, 307, 400, 401, 402, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 429, 431, 444, 450, 451, 500, 502, 503, 504, 506, 507, 508, 509, 510, 511];

    const handleRandomClick = () => {
        const randomIndex = Math.floor(Math.random() * availableStatusCodes.length);
        const randomStatusCode = availableStatusCodes[randomIndex];
        setImageUrl(`https://http.cat/${randomStatusCode}.jpg`);
    };

    return (
        <div style={{ backgroundColor: 'rgba(20, 20, 20, 0.65)' }}>
            <AppExplanation />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <button onClick={handleRandomClick} style={{ padding: '5px 10px', cursor: 'pointer' }}>random</button>
                {imageUrl && <img src={imageUrl} alt="Random HTTP Status Cat" style={{ maxWidth: '100%', height: 'auto', marginTop: '20px' }} />}
            </div>
            <Explanation />
        </div>
    );
};

/**
 * A React component that provides an explanation about the RandomHttpStatusCat functionality.
 * It informs users about the purpose and utility of the RandomHttpStatusCat feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
const Explanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p>
                <br />
                <br />
                this feature shows random cat images corresponding to various http status codes <br />
                users can click a "random" button to generate a random http status code from a predefined list
            </p>
        </div>
    );
};

export default RandomHttpStatusCat;

/**
 * A React component that provides an explanation about the app.
 * It informs users about the backstory, purpose, and technology used in the app.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
 const AppExplanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '4rem' }}>
                !! heads up, this app is just for testing and ethical hacking purposes, best to run it in a lab or virtual machine, i'm not responsible if anyone uses this app and causes any harm !!
            </p>
            <p>
                hey, this app's a bit of a mix of my interests in pentesting, networking, also security in general and learning C <br />
                been diving into these techs for the last year and a half, soaking up what i can from books and stuff i just basically wanted to try it in practice
                <br /><br />
                btw, this thing's all set up to run locally on your machine - sorta like a personal playground where i'm coding and learning at the same time. not planning to deploy it anywhere, just keeping it real on the local
                <br /><br />
                so, for the tech <br />
                on the front-end, it's all about react and <strong>typescript</strong> <br />
                back-end is a different story - it's written in <strong>C</strong>, using the libmicrohttpd library for the http server, plus some <strong>python</strong> scripts, <br />
                and yep, compiled with gcc
                <br /><br />
                react with typescript for front-end and C for back-end is not everyday combo. usually, you would use express or node.js, but i wanted to roll up my sleeves and code something meaningful in C
                <br />
                <br />
                „ugly, but powerful“
            </p>
        </div>
    );
};
