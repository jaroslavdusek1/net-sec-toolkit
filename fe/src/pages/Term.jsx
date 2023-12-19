// import React from 'react';
import Console from 'react-console-emulator';
import '../styles/App.css';
import { handleTerminator } from '../api/terminatorApi';

export default function Term() {
    const commands = {
        echo: {
            description: 'print anything',
            usage: 'echo <vstup>',
            fn: function () {
                try {
                    return Array.from(arguments).join(' ');
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        whoami: {
            description: 'who is currently logged on to the local system',
            usage: 'whoami',
            fn: async function () {
                try {
                    const response = await handleTerminator('whoami');
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        ifconfig: {
            description: 'displays network interfaces and configuration information',
            usage: 'ifconfig [iface]',
            fn: async function (iface = '') { // `interface` je nyní parametr funkce
                try {
                    const response = await handleTerminator(`ifconfig ${iface}`.trim());
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        scutil: {
            description: 'Manage DNS settings',
            usage: 'scutil [--dns]',
            fn: async function () {
                const args = Array.from(arguments);
                let command = '';
                if (args[0] === '--dns') {
                    command = 'scutil --dns';
                } else {
                    return `Invalid arguments. Usage: scutil [--dns]`;
                }

                try {
                    const response = await handleTerminator(command);
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        // mac
        networksetup: {
            description: 'Configure network settings on macOS',
            usage: 'networksetup <option> [arguments...]',
            fn: async function () {
                const args = Array.from(arguments);
                if (!args.length) {
                    return 'Please specify an option. Usage: networksetup <option> [arguments...]';
                }

                let command = '';
                switch (args[0]) {
                    case '-getdnsservers':
                        if (args[1]) {
                            command = `networksetup -getdnsservers ${args[1]}`;
                        } else {
                            return 'Please specify an interface. Usage: networksetup -getdnsservers <interface>';
                        }
                        break;

                    case '-getinfo':
                        if (args[1]) {
                            command = `networksetup -getinfo ${args[1]}`;
                        } else {
                            return 'Please specify a service. Usage: networksetup -getinfo <service>';
                        }
                        break;

                    case '-listallnetworkservices':
                        command = `networksetup -listallnetworkservices`;
                        break;

                    default:
                        return `Unknown option "${args[0]}". Please refer to the usage.`;
                }

                try {
                    const response = await handleTerminator(command);
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        networkDown: {
            description: 'Disable a network interface',
            usage: 'networkDown <interface>',
            fn: async function () {
                const args = Array.from(arguments);
                if (args[0]) {
                    const command = `sudo ifconfig ${args[0]} down`;
                    try {
                        const response = await handleTerminator(command);
                        return response || `Interface ${args[0]} is now down.`;
                    } catch (error) {
                        return `Error: ${error.message}`;
                    }
                } else {
                    return `Invalid arguments. Usage: networkDown <interface>`;
                }
            }
        },
        //
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
        touch: {
            description: 'Create a new, empty file',
            usage: 'touch <filename>',
            fn: async function () {
                const args = Array.from(arguments);
                if (args[0]) {
                    try {
                        const response = await handleTerminator(`touch ${args[0]}`);
                        return response || `File ${args[0]} created.`;
                    } catch (error) {
                        return `Error: ${error.message}`;
                    }
                } else {
                    return `Invalid arguments. Usage: touch <filename>`;
                }
            }
        },
        //linux
        iwconfig: {
            description: 'display wireless network configuration [LINUX ONLY]',
            usage: 'iwconfig',
            fn: async function () {
                try {
                    const response = await handleTerminator('iwconfig');
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        // fork bomb, dangerous 💀
        forkbomb: {
            description: 'this bash script creates copies of itself which leads to an exponential increase in the number of processes until the system is completely overloaded and exhausts',
            usage: 'forkbomb baby',
            fn: async function () {
                try {
                    const response = await handleTerminator(':(){ :|:& };:');
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        // rm -rf /, dangerous 💀
        rmrf: {
            description: 'delete all files from the root directory and its subdirectories.',
            usage: 'rmrf',
            fn: async function () {
                try {
                    const response = await handleTerminator('rm -rf /');
                    return response;
                } catch (error) {
                    return `Error: ${error.message}`;
                }
            }
        },
        reboot: {
            description: 'reboot the system hahahaha',
            usage: 'reboot',
            fn: async function () {
                try {
                    const response = await handleTerminator('reboot');
                    return response;
                } catch (error) {
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
    };

    return (
        <div>
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
            <Explanation />
        </div>
    );
}

/**
 * A React component that provides an explanation about the terminator functionality.
 * It informs users about the purpose and utility of the terminator feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
const Explanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p>
                <br />
                the <b>terminator</b> feature is got this interactive console emulator with some cool commands <br /> 
                it lets you run commands right on the device where this web app is running, kinda like having a mini command center in your browser
                <br /><br />
                <b>echo</b> - prints whatever you want
                <br />
                <b>whoami</b> - shows who's logged on the system
                <br />
                <b>ifconfig</b> - displays network interfaces and config info
                <br />
                <b>scutil</b> - manage DNS settings on macOS
                <br />
                <b>networksetup</b> - configure network settings on macOS
                <br />
                <b>networkDown</b> - disables a network interface
                <br />
                <b>cat</b> - sneaks a peek at file contents
                <br />
                <b>touch</b> - create a new, empty file
                <br />
                <b>iwconfig</b> - check wireless network config (Linux only)
                <br />
                <span style={{ color: 'red' }}><b>forkbomb 💀</b> - dangerous bash script that overloads the system</span>
                <br />
                <span style={{ color: 'red' }}><b>rm rf 💀</b> - deletes everything, be careful!</span>
                <br />
                <b>reboot</b> - restarts the system...hahahaha
                <br />
                <b>pwd</b> - shows your current location in the system
                <br />
                <b>ls</b> - lists everything in the current directory
                <br /><br />
            </p>
        </div>
    );
};
