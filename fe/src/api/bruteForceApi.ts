/**
 * Sends a POST request to the `/brute_force_check` endpoint to initiate a dictionary attack using the provided password.
 * 
 * @async
 * @function
 * @param {string} password - The password to be checked using dictionary attack.
 * @returns {Promise<string>} Returns the response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function dictionaryAttack(password: string): Promise<string> {

    console.log('Sending password: --->', password);
    console.log('body: JSON.stringify({ password })', JSON.stringify({ password }));

    // send the POST request to the /brute_force endpoint on the server
    const response = await fetch("http://localhost:8080/brute_force_check", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({ password })
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
