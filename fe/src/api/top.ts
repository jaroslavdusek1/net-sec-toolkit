/**
 * Sends a POST request to the `/top` endpoint to initiate a top command to see all currently running processes.
 * 
 * @async
 * @function
 * @returns {Promise<string>} Returns the formatted response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function Tops(): Promise<string> {
    const response = await fetch('http://localhost:8080/top', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        console.error('top.ts - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log('response ok', response);
    }

    const text = await response.text();
    const data = JSON.parse(text);
    console.log("api data", data);
    return data;
}
