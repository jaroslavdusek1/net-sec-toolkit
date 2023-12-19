/**
 * Sends a terminal command to the server to be executed.
 * Sends a POST request to the `/terminator` endpoint with the provided command.
 * 
 * @async
 * @function
 * @param {string} command - The command to be executed on the server.
 * @returns {Promise<string>} Returns the output of the executed command from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function handleTerminator(command: string): Promise<string> {

    console.log('Sending command: --->', command);
    console.log('body: JSON.stringify({ command })', JSON.stringify({ command }));

    const response = await fetch("http://localhost:8080/terminator", {
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

    // Get response as text
    const text = await response.text();
    console.log('Received response text:', text);

    // Check for empty output
    if (/{"output":"\s*"}/.test(text.trim())) {
        return "done";
    } else {
        // Escape control chars
        const validJson = text.replace(/\n/g, '\\n');
        let parts = validJson.split('{"output":"');
        let secondPart = parts[1];
        // Sanitize
        let finalOutput = secondPart.replace('"\n}', '').replace('"\n', '').replace('"\r\n', '').replace('"}', '').trim();
        return finalOutput;

        // // get response as text
        // const text = await response.text();
        // console.log('Received response text:', text);
        // // escape control chars
        // const validJson = text.replace(/\n/g, '\\n');
        // let parts = validJson.split('{"output":"');
        // let secondPart = parts[1];
        // // sanitize
        // let finalOutput = secondPart.replace('"\n}', '').replace('"\n', '').replace('"\r\n', '').replace('"}', '').trim();
        // return finalOutput;
    }
}