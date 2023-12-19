import React, { useState, useEffect } from 'react';
import { handleFiles } from '../api/files.ts';
import { downloadFile } from '../api/download.ts';

export default function BuffetBinary() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            console.log("Calling /buffet API...");
            const response = await handleFiles();
            console.log("response");
            setFiles(response);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>buffet binary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", maxWidth: "50rem", margin: "auto" }}>
                {files.map(file => (
                    <div key={file} style={{ textAlign: "center" }}>
                        <div>
                            <img src="/bin_icon.png" alt="Bin Icon" style={{ width: "10rem", height: "auto" }} />
                        </div>
                        <div style={{ color: "white" }}>
                            {file}
                            <a
                                href="#!"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await downloadFile(file);
                                    } catch (error) {
                                        console.error('Error downloading file:', error.message);
                                    }
                                }}
                                style={{ color: "white", textDecoration: "none" }}
                            >
                                &nbsp;&nbsp;💾
                            </a>
                        </div>
                    </div>
                ))}
            </div>
            <Explanation />
        </div>
    );
}

/**
 * A React component that provides an explanation about the buffet_binary functionality.
 * It informs users about the purpose and utility of the buffet_binary feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
 const Explanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p>
                <br />
                the <strong>ping_google_dns</strong>
                <p>this is a just basic ICMP request, you hit up google's public dns servers with a ping</p>
                <br />
                <br />
                the <strong>fork_bomb</strong> 
                <p>this bad guy fires up a fork bomb, creating a crazy amount of processes till your system's gonna crush. <br /> 
                just be careful with this one, recommended to use it in a safe spot</p>
                <br />
                <br />
                the <strong>spoof_mac_linux</strong>
                <p>this one is for changing your mac address on linux systems. <br /> 
                handy for when you are testing networks or wanna keep your privacy on public wi-fi</p>
            </p>
        </div>
    );
};
