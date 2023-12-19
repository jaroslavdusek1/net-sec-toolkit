/**
 * Initiates a SYN flood attack against a specified target IP, port, and MAC address.
 * Sends a POST request to the `/SYN_flood` endpoint with the provided target information.
 * 
 * @async
 * @function
 * @param {string} target_ip - The target IP address for the SYN flood attack.
 * @param {string} target_port - The target port for the SYN flood attack.
 * @param {string} mac_address - The MAC address associated with the target.
 * @returns {Promise<string>} Returns the response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function SToll(target_ip: string, target_port: string, mac_address: string): Promise<string> {

    // console.log('Sending target: --->', target_ip);
    // console.log('Sending target_port: --->', target_port);
    // console.log('Sending mac_address: --->', mac_address);

    // send the POST request to the /SYN_flood endpoint on the server
    const response = await fetch("http://localhost:8080/SYN_flood", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({ target_ip, target_port, mac_address })
    });

    // handle the response
    if (!response.ok) {
        console.error('SYN FLOOD - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log("response okkkkk", response);
    }

    // Parse the JSON response
    const responseData = await response.json();
    const pid = responseData.pid;

    // Construct and return the desired output with quotes
    return `flood PID is "${pid}",\nyou can kill with command "kill ${pid}"`;
}