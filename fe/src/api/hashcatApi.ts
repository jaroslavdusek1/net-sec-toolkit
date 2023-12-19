/**
 * Sends a terminal command to the server to be executed.
 * Sends a POST request to the `/hashcat` endpoint with the provided command.
 * 
 * @async
 * @function
 * @param {string} command - The command to be executed on the server.
 * @returns {Promise<string>} Returns the output of the executed command from the server.
 * @throws {Error} Throws an error if the server returns a non-OK status.
 */

export async function handleHashcat(command: string): Promise<string> {

    console.log('Sending command: --->', command);
    console.log('body: JSON.stringify({ command })', JSON.stringify({ command }));

    console.log("17 command", command);

    const response = await fetch("http://localhost:8080/hashcat", {
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

    // get response as text
    let processedOutput;
    const text = await response.text();

    console.log("hashcat text", text);

    if (text.includes("Parsed Hashes")) {
        processedOutput = processOutput(text);
        return processedOutput;

    } else {

        processedOutput = cleanHashcatOutput(text);
        return processedOutput;
    }

}

/**
 * Processes the output from a hashcat command and extracts relevant information.
 * @param {string} text - The raw output text from hashcat.
 * @returns {string} A string containing the processed and formatted relevant information.
 */
function processOutput(text: string): string {
    const patterns: RegExp[] = [
        /Minimum password length supported by kernel: \d+/,
        /Maximum password length supported by kernel: \d+/,
        /Counting lines in hashes.txt. Please be patient.../,
        /Counted lines in hashes.txt/,
        /Parsing Hashes: \d+\/\d+ \(\d+.\d+%\).../,
        /Parsed Hashes: \d+\/\d+ \(\d+.\d+%\)/,
        /Sorting hashes. Please be patient.../,
        /Sorted hashes/,
        /Removing duplicate hashes. Please be patient.../,
        /Removed duplicate hashes/,
        /Sorting salts. Please be patient.../,
        /Sorted salts/,
        /Comparing hashes with potfile entries. Please be patient.../,
        /Compared hashes with potfile entries/,
        /INFO: All hashes found as potfile and\/or empty entries! Use --show to display them./,
        /Started: .+/,
        /Stopped: .+/
    ];

    // Create an array to store the results
    const results: string[] = [];

    // Iterate through each pattern and search in the text
    patterns.forEach((pattern) => {
        const match = text.match(pattern);
        if (match) {
            results.push(match[0]);
        }
    });

    // Join the results into a single string with new lines
    const finalOutput = results.join('\n');
    return finalOutput;
}

/**
 * Cleans the output string by removing leading and trailing characters
 * and splitting at a specified delimiter.
 * @param {string} output - The output string from hashcat.
 * @returns {string} The cleaned output string.
 */
 function cleanHashcatOutput(output: string) {
    // Split the string at the given delimiter and take the second part
    const splitOutput = output.split('{"output":"')[1];
  
    // Remove the trailing characters
    const cleanOutput = splitOutput
      .replace(/\\n/g, '\n') // Replace escaped newlines with actual newlines
      .replace(/\\"/g, '"')  // Replace escaped double quotes with actual double quotes
      .slice(0, -2);         // Remove the last two characters ("})
  
    return cleanOutput.trim(); // Trim whitespace from both ends of the string
  }
  