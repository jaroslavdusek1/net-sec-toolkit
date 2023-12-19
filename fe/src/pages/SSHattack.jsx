import Console from 'react-console-emulator';
import { handleBruteARP } from '../api/bruteARP.ts';
import { handleEcho } from '../api/echoApi';
import { handleHashcat } from '../api/hashcatApi';
import { handleNetcat } from '../api/netcatApi';
import { handlePing } from '../api/ping';
import { handleTerminator } from '../api/terminatorApi';
import LoadingCircle from '../components/Spinner';
import { useState } from 'react';
import '../styles/App.css';

export default function SSHattack() {
    const [loading, setLoading] = useState(false);

    const commands = {
        cat: {
            description: 'concatenate and display file content',
            usage: 'cat <file>',
            fn: async function () {
                const args = Array.from(arguments);
                if (args[0]) {
                    try {
                        const filePath = args[0];
                        const response = await handleTerminator(`cat ${filePath}`);
                        return response;
                    } catch (error) {
                        return `Error: ${error.message}`;
                    }
                } else {
                    return `Invalid arguments. Usage: cat <file>`;
                }
            }
        },
        echoAp: {
            description: 'append text to a file',
            usage: 'echoAppend <text> >> <file>',
            fn: async function () {
                try {
                    const args = Array.from(arguments);

                    console.log("args", args);

                    const command = `echo ${args[0]} ${args[1]} ${args[2]}`;

                    console.log("Command to be sent:", command);

                    const response = await handleEcho(command);
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        // hydra
        hydra: {
            description: 'run hydra with the specified options',
            usage: 'hydra <options> <server://service>',
            fn: async function () {
                const args = Array.from(arguments);
                console.log("args: -->", ...args);
        
                // Check for the minimum number of arguments needed for hydra
                if (args.length >= 3) {
                    try {
                        // Construct the hydra command with arguments
                        // Example usage: hydra -l user -P passlist.txt ftp://192.168.0.1
                        let hydraCommand = `hydra ${args[0]} ${args[1]} ${args[2]}`;
        
                        // Add additional options if any
                        for (let i = 3; i < args.length; i++) {
                            if (args[i] !== undefined) {
                                hydraCommand += ` ${args[i]}`;
                            }
                        }
        
                        console.log("hydra command: -->", hydraCommand);
        
                        // Call the server endpoint that will execute hydra
                        const response = await handleHashcat(hydraCommand);
        
                        console.log("response", response);
                        return response;
                    } catch (error) {
                        return `Error: ${error.message}`;
                    }
                } else {
                    return `Invalid arguments. Usage: ${this.usage}`;
                }
            }
        },        
        ls: {
            description: 'list',
            fn: async function () {
                try {
                    const response = await handleTerminator('ls');
                    console.log("Term.jsx - response", response);
                    return response;
                } catch (error) {
                    console.error('Error when calling handleTerminator:', error);
                    return `Error: ${error.message}`;
                }
            }
        },
        // netcat
        nc: {
            description: 'run netcat to check a specific port',
            usage: 'nc <ip> <port>',
            fn: async function () {
                const args = Array.from(arguments);

                console.log(args[0]);
                console.log(args[1]);
                console.log(args[2]);
        
                // Check for the minimum number of arguments needed for nc
                if (args.length === 3) {
                    try {
                        // Construct the nc command with arguments
                        const ip = args[1]; // The IP address
                        const port = args[2]; // The port number
                        const ncCommand = `nc ${args[0]} ${ip} ${port}`;
        
                        console.log("nc command: -->", ncCommand);
        
                        // Call the server endpoint that will execute nc
                        // const response = await handleHashcat(ncCommand);
                        // const response = await handleTerminator(ncCommand);
                        const response = await handleNetcat(ncCommand);
        
                        console.log("response", response);
                        return response;
                    } catch (error) {
                        return `Error: ${error.message}`;
                    }
                } else {
                    return `Invalid arguments. Usage: ${this.usage}`;
                }
            }
        },
                // icmp echo request
                ping: {
                    description: 'Ping the specified IP address',
                    fn: async function (ip) {
                        setLoading(true);
                        try {
                            const response = await handlePing(ip);
                            setLoading(false);
                            return <span style={{ color: 'green' }}>{response}</span>;
                        } catch (error) {
                            setLoading(false);
                            console.error('Error when calling ping:', error);
                            return `Error: ${error.message}`;
                        }
                    }
                },
        
        rm: {
            description: 'remove file',
            usage: 'rm <filename>',
            fn: async function () {
                try {
                    const args = Array.from(arguments);
                    if (!args.length) {
                        return 'Error: No file name provided';
                    }
                    const filename = args[0];
                    const command = `rm ${filename}`;

                    console.log("Command to be sent:", command);

                    // Assuming you have a general purpose function to handle shell commands
                    const response = await handleTerminator(command);
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        // spoof
        spoof: {
            description: 'start arp spoofing',
            fn: async function () {
                setLoading(true);
                try {
                    const response = await handleBruteARP();
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when calling handleBruteARP:', error);
                    return `Error: ${error.message}`;
                }
            }
        },
    };

    return (
        <div>
            <h2>dictionary SSH hydra attack</h2>
            <div className="terminal">
                <h2 style={{ color: 'red' }}>terminator</h2>
                {loading && <LoadingCircle />}
                <Console
                    commands={commands}
                    style={{
                        textAlign: 'left',
                        background: 'transparent',
                        color: 'green',
                    }}
                    promptLabel=">>>"
                />
            </div>
            <Explanation/>
        </div>
    );
}

/* 
- start with a spoof command, 
- if you can not see you target device, try ping and IP ...
- target device should be visible


*/

/**
 * A React component that provides an explanation about the SSH Attack functionality.
 * It informs users about the purpose and utility of the SSH Attack feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */

 const Explanation = () => {
    return (
        <div>
            <p>
                <br />
                this is designed for cracking SSH credentials, <br />
                <br />
                <strong>hydra</strong> is your brute force buddy, very used tool amongs pentester, natively in kali linux <br />
                <strong>nc</strong> (netcat) for network connections, letting you check ports with stealth also to check open ports for vulnerabilities <br />
                <strong>ping</strong> plays echo-location, to ensure the server is at home and reachable <br />
                <strong>spoof</strong> is all about deception, masquerading as another device to manipulate the network traffic <br /><br />
                Use <strong>cat</strong> to sneak a peek at file contents, <br />
                <strong>ls</strong> to list all files in the current directory, <br />
                and <strong>rm</strong> to delete files, sweeping away. <br /><br />

                Keep in mind, this is for educational use only. It's a demo of what is possible within this app
            </p>
            <h5 style={{ color: 'black' }}>how to protect</h5>
            <p>
                staying safe against these kinds of tools involves:
                <br /> <br />
                <strong>strong passwords</strong>: avoid common or simple passwords. longer, complex ones are harder to crack
                <br />
                <strong>firewalls</strong>: properly configured firewalls can help block unauthorized access attempts
                <br />
                <strong>network monitoring</strong>: keep an eye on your network for any unusual activities, like numerous login attempts
                <br />
                <strong>limit login attempts</strong>: setting limits on how many times a password can be tried can thwart brute force attacks
                <br />
                <strong>keep systems updated</strong>: ensure your software, especially security software, is up to date
                <br /><br />
                these steps can help protect your network and systems from unauthorized access and keep your data secure
            </p>
        </div>
    );
};
