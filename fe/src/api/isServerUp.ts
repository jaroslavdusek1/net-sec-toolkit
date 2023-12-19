interface ServerStatusResponse {
    status: string;
  }
  
  /**
   * Checks if the server is up and returns its status.
   * 
   * This function makes a GET request to the server's status endpoint. 
   * If the response is successful, it parses the JSON response and 
   * returns the status message. If the response is not successful, 
   * it throws an error with the HTTP status code and text.
   * 
   * @returns {Promise<string>} A promise that resolves with the server status message.
   * @throws Will throw an error if the response from the server is not OK.
   */
  export async function isServerUp(): Promise<string> {
      const response = await fetch('http://localhost:8080/status');
      if (!response.ok) {
          throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
      }
      const data: ServerStatusResponse = await response.json();
      return data.status;
  }
