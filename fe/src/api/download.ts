/**
 * Sends a POST request to the '/downloadFile' endpoint to initiate the download of a specific file.
 * 
 * @async
 * @function
 * @param {string} name - The name of the file to be downloaded.
 * @returns {Promise<Response>} Returns the server response.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */
export async function downloadFile(name: string): Promise<void> {
    console.log("called dFile api...");
    const response = await fetch('http://localhost:8080/dFile', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ name: name }),
    });

    if (!response.ok) {
        console.error('download API.ts - Error in response:', response.status, response.statusText);
        throw new Error('Server returned an error');
    } else {
        console.log('response ok: -->', response);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}