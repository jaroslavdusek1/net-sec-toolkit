/**
 * Sends a POST request to the `/sigkill` endpoint to terminate a specific process.
 * 
 * @async
 * @function
 * @param {number|string} processIdentifier The ID or name of the process to be terminated.
 * @returns {Promise<string>} Returns the formatted response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */
export async function SIGKILLbaby(processIdentifier: number | string): Promise<string> {
    let bodyPayload;

    if (typeof processIdentifier === 'number') {
        bodyPayload = { pid: processIdentifier }; // for process ID
    } else {
        bodyPayload = { pid: processIdentifier }; // for process name
    }

    console.log("bodyPayload", bodyPayload);

    const response = await fetch('http://localhost:8080/sigkill', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
        console.error('SIGKILL API.ts - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log('response ok', response);
    }
    
    const text = await response.text();
    return text;
}