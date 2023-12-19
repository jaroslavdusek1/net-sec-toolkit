/**
 * Sends a POST request to the `/filesList` endpoint to get a list of files,
 * and filters out specific files from the received list.
 * 
 * @async
 * @function
 * @returns {Promise<Array<Object>>} Returns the filtered list of files.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */
 export async function handleFiles(): Promise<Array<string>> {
  const response = await fetch('http://localhost:8080/filesList', {
      method: 'POST',
      headers: {
          'Content-type': 'application/json',
      },
      body: JSON.stringify({}),
  });

  if (!response.ok) {
      console.error('handleFiles API.ts - Error in response:', response.status, response.statusText);
      throw new Error('Server returned an error');
  } else {
      console.log('response ok', response);
  }

  // Parse the JSON response to get the list of files
  const filesList = await response.json();

  // Define the files to be filtered out
  const filesToFilterOut = ['readme.txt', '.DS_Store'];

  // Filter out the specified files
  const filteredFilesList = filesList.filter((file: string) => 
      !filesToFilterOut.includes(file)  // Now checking directly against the file string
  );

  return filteredFilesList;
}
