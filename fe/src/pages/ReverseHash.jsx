import Console from 'react-console-emulator';
// import { Tops } from '../api/top.ts';
// import { SIGKILLbaby } from '../api/sigkill.ts';
// import { useState } from 'react';
// import LoadingCircle from '../components/Spinner';
import { handleEcho } from '../api/echoApi';
import { handleHashcat } from '../api/hashcatApi';
import { handleTerminator } from '../api/terminatorApi';
import '../styles/App.css';

export default function ReverseHash() {
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
        echoOw: {
            description: 'write text to a file (overwrite)',
            usage: 'echoOw <text> <file>',
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
        hashcat: {
            description: 'run hashcat with the specified options',
            usage: 'hashcat <hash> <attack-mode> <hash-file> <wordlist>',
            fn: async function () {
                const args = Array.from(arguments);
                // Args includes params for hashcat
                if (args) {
                    try {
                        // collect command
                        let hashcatCommand = `sudo hashcat -m ${args[1]} -a ${args[3]} ${args[4]} ${args[5]}`;

                        // --show option to display pws
                        if (args[6] !== undefined) {
                            hashcatCommand += ` ${args[6]}`;
                        }
                        const response = await handleHashcat(hashcatCommand);
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
        pwd: {
            description: 'print the current working directory',
            fn: async function () {
                try {
                    const response = await handleTerminator('pwd');
                    console.log("Term.jsx - response", response);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    console.error('Error when calling handleTerminator:', error);
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
        }
    };
    return (
        <div>
            {/* <h2>hash</h2><img src={`${process.env.PUBLIC_URL}/cat.png`} alt="Cat" style={{ marginLeft: '10px' }} /> */}
            <h2 style={{ display: 'inline-block', marginRight: '10px' }}>hash</h2>
            <img src={`${process.env.PUBLIC_URL}/cat.png`} alt="Cat" style={{ display: 'inline-block', marginTop: '-5rem', width: '10rem' }} />
            <div className="terminal">
                <h2 style={{ color: 'red' }}>terminator</h2>
                <Console
                    commands={commands}
                    style={{
                        textAlign: 'left',
                        background: 'transparent',
                        color: 'green'
                    }}
                    promptLabel=">>>"
                />
            </div>
            <Explanation/>
        </div>
    );
}

/**
 * A React component that provides an explanation about the ReverseHash functionality.
 * It informs users about the purpose and utility of the ReverseHash feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */

 const Explanation = () => {
    return (
      <div>
        <p>
        <br />
        this reverse hash thing is its all about using hashcat, that open-source powerhouse you usually see in kali linux. <br /><br />it's got street cred in the security realm for its ability to crack a whole bunch of hash types
        of following:
        <br />
        <strong>SHA family</strong> (SHA1, SHA2-256, SHA2-512, SHA3), <br /> <strong>MySQL</strong> and <strong>PostgreSQL</strong> database hashes, <br /> <strong>WPA/WPA2</strong> pre-shared keys etc.. <br /> <br />
        commands are your toolkit here: <br /> <strong>cat</strong> lets you peek into file contents,  <br /> <strong>echoOw</strong> is your go-to for overwriting files,  <br /> <strong>echoAp</strong> for when you want to tack on some more,  <br />and <strong>hashcat</strong> for smashing those hashes like a boss.
        </p>
        <img src="/hashing.png" alt="hashing" />
      </div>
    );
  };

/* SHA-512

2^512

each bit 0 or 1

possible combinations =
134078079299425970995740249982058461274793658205923933
77723561443721764030073546976801874298166903427690031
858186486050853753882811946569946433649006084097

in order to avoid rainbow table attacks is added SALT (8,16,32,64 length)

*/