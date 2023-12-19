/**
 * Sends a POST request to the `/brute_ARP` endpoint to initiate a Brute ARP attack.
 * 
 * @async
 * @function
 * @returns {Promise<string>} Returns the formatted response text from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function handleBruteARP(): Promise<string> {
  const response = await fetch('http://localhost:8080/brute_ARP', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    console.error('bruteArp API.ts - Error in response:', response.status, response.statusText);
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
