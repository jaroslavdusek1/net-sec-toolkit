/**
 * Sends a terminal command to the server to be executed.
 * Sends a POST request to the `/echo` endpoint with the provided command.
 * 
 * @async
 * @function
 * @param {string} command - The command to be executed on the server.
 * @returns {Promise<string>} Returns the output of the executed command from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function handleEcho(command: string): Promise<string> {

    console.log('Sending command: --->', command);
    console.log('body: JSON.stringify({ command })', JSON.stringify({ command }));

    console.log("17 command: =====>", command);

    const response = await fetch("http://localhost:8080/echo", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({ command })
    });

    if (!response.ok) {
        console.error('Terminator API.ts - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log("response ok", response);
    }

    // success
    const text = await response.text();
    console.log("text", text);
    return text
        ?
        "done"
        : ""
}