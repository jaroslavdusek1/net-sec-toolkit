/**
 * Initiates a network scan using the nmap tool against a specified target.
 * Sends a POST request to the `/nmap` endpoint with the provided target information.
 * 
 * @async
 * @function
 * @param {string} target - The target (e.g., IP address or domain name) to be scanned.
 * @returns {Promise<string>} Returns the scan results from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function nmap(target: string): Promise<string> {

    console.log('Sending target: --->', target);
    console.log('body: JSON.stringify({ password })', JSON.stringify({ target }));

    // send the POST request to the /nmap endpoint on the server
    const response = await fetch("http://localhost:8080/nmap", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({ target })
    });

    // handle the response
    if (!response.ok) {
        console.error('BruteForce API.ts - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log("response ok", response);
    }

    return await response.text()
}
