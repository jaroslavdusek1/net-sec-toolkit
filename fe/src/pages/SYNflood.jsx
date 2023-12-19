import Console from 'react-console-emulator';
import LoadingCircle from '../components/Spinner';
import { useState } from 'react';
import { handleBruteARP } from '../api/bruteARP.ts';
import { SToll } from '../api/floodAPI.ts';
import { handlePing } from '../api/ping';
import { nmap } from '../api/nmapAPI.ts';
import { SIGKILLbaby } from '../api/sigkill.ts';
import '../styles/App.css';

export default function SYNflood() {
    const [loading, setLoading] = useState(false);

    /**
     * Asynchronously sends a request to terminate a specific process.
     * Updates the loading state before and after the API call.
     * 
     * @async
     * @function
     * @returns {void} Nothing.
     * @throws Will log an error to the console if an error occurs during the API call.
     */
    // async function handleStop() {
    //     setLoading(true);
    //     try {
    //         // Replace with your API call to send SIGKILL
    //         const response = await SIGKILLbaby(); // create and import
    //         setLoading(false);
    //         console.log(response);
    //     } catch (error) {
    //         setLoading(false);
    //         console.error('Error when sending SIGKILL:', error);
    //     }
    // }

    const commands = {
        spoof: {
            description: 'Start ARP spoofing',
            fn: async function () {
                setLoading(true);
                try {
                    const response = await handleBruteARP();
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when calling handleBruteARP:', error);
                    return `Error: ${error.mestvlsage}`;
                }
            }
        },


        // nmap target scan
        nmap: {
            description: 'Start nmap scan',
            fn: async function (target) {
                setLoading(true);
                try {
                    const response = await nmap(target);
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when calling nmap:', error);
                    return `Error: ${error.message}`;
                }
            }
        },


        // flood
        flood: {
            description: 'Start SYN flood attack',
            fn: async function (target, target_port, mac_address) {
                setLoading(true);
                try {
                    const response = await SToll(target, target_port, mac_address);
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when initiating SYN flood:', error);
                    return `Error: ${error.message}`;
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

        kill: {
            description: 'Terminate a process and its child processes based on the provided PID',
            fn: async function (pid) {
                setLoading(true);
                try {
                    const response = await SIGKILLbaby(pid);
                    setLoading(false);
                    return <span style={{ color: 'green' }}>{response}</span>;
                } catch (error) {
                    setLoading(false);
                    console.error('Error when trying to kill the process:', error);
                    return `Error: ${error.message}`;
                }
            }
        }
    };

    return (
        <div>
            <h2 style={{ flex: 1, textAlign: 'center' }}>SYN flood</h2>
            <div className="terminal">
                <h2 style={{ color: 'red' }}>terminator</h2>

                {loading && <LoadingCircle />}

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
 * A React component that provides an explanation about the SYN Flood functionality.
 * It informs users about the purpose and utility of the SYN Flood feature.
 * 
 * @component
 * @returns {JSX.Element} A rendered Explanation component.
 */
const Explanation = () => {
    return (
        <div style={{ textAlign: 'left' }}>
            <p>
                <br />
                the SYN flood feature in this app is like having a mini hacking lab in your browser, <br />
                it's packed with commands for some real cyber action:
                <br /><br />
                - <b>spoof</b>: get into arp spoofing, kinda like tricking devices on a network
                <br />
                - <b>nmap</b>: run nmap scans, super useful for checking out what's on a network
                <br />
                - <b>flood</b>: launch a syn flood attack, but hey, keep it cool, it's just for practice
                <br />
                - <b>ping</b>: ping any ip to see if it's up and running
                <br />
                - <b>kill</b>: need to stop a process? this command's got you covered
                <br /><br />
                it's all set up for learning and experimenting in a safe space, so have fun, but remember, no shady stuff!
            </p>

            <h5 style={{ color: 'white' }}>what is a SYN flood</h5>
            <p>
                a <strong>syn flood</strong> is a type of cyber attack where a bunch (depends on your NIC) of syn packets (flag -S) used for synchronize while 3-way-handshake are sent to a certain target within network to overwhelm it, <br />
                this can slow down or crash the system, 'cause it's busy trying to respond to all these fake connection requests
            </p>
            <img src="/syn-flood.jpg" alt="syn-flood" style={{ opacity: 0.85 }} />


            <br /> <br />
            <h5 style={{ color: 'white' }}>what is a 3-way-handshake</h5>
            <p>
                a three-way handshake is a process used in TCP/IP networks to establish a connection between a client and server <br />
                it involves three steps:
                <br /> <br />
                <strong>SYN</strong>- the client sends a SYN (synchronize) packet to the server to start the connection and sets a sequence number for tracking
                <br />
                <strong>SYN-ACK</strong>- the server responds with a SYN-ACK (synchronize-acknowledge) packet, acknowledging the client's SYN and sending its own sequence number
                <br />
                <strong>ACK</strong>- the client sends an ACK (acknowledge) packet back to the server, acknowledging the server's SYN-ACK
                <br /> <br />
                this handshake ensures both parties are ready to transmit data, and sets up initial sequence numbers for the data transfer
            </p>
            <img src="/3-wh.png" style={{width: "42rem"}} alt="3-way-handshake" />

            <br /> <br />
            <h5 style={{ color: 'white' }}>how to protect against syn flood</h5>
            <p>
                protecting against a syn flood attack involves a few key strategies:
                <br /> <br />
                <strong>firewall configuration</strong>: set up rules to limit the rate of incoming syn packets
                <br />
                <strong>syn cookies</strong>: this technique helps by not allocating connection resources until the three-way handshake is complete
                <br />
                <strong>load balancers</strong>: using load balancers can distribute the traffic across multiple servers, reducing the impact on any single server
                <br />
                <strong>network monitoring</strong>: keep an eye on your network traffic for unusual increases in syn packets which could signal an attack
                <br />
                <br /> <br />
                employing these methods can really beef up your network's defense against syn flood attacks, keeping your system more secure
            </p>
        </div>
    );
};