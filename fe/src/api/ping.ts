/**
 * Sends a POST request to the `/ping` endpoint to initiate a ping.
 * 
 * @async
 * @function
 * @param {string} ip The IP address to be pinged.
 * @returns {Promise<string>} Returns the formatted response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */
 export async function handlePing(ip: string): Promise<string> {
    const response = await fetch('http://localhost:8080/ping', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ ip }),
    });
  
    if (!response.ok) {
      console.error('Ping API.ts - Error in response:', response.status, response.statusText);
      throw new Error('Server returned an error');
    } else {
      console.log('response ok', response);
    }
  
    // get response as text
    const text = await response.text();
    // text formatting
    const formattedText = text
      .replace(/\?/g, '')
      .replace(/ \| /g, '\n');
    return formattedText;
  }
  