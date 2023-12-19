#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <microhttpd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <dirent.h>
#include <limits.h>
#include <jansson.h>

#define MAXDATASIZE 8192 // 8KB
#define MAC_ADDRESS_LENGTH 18

/**
 * @brief Sends a file to the client over an HTTP connection.
 *
 * This function reads a file from the given file path, creates an HTTP response with the file's
 * contents, and queues the response for sending over the provided MHD_Connection. The content type
 * is set to 'application/octet-stream', and a 'Content-Disposition' header is added to prompt the
 * client to download the file.
 *
 * @param connection A pointer to the MHD_Connection structure representing the client connection.
 * @param file_path A C string containing the path to the file that needs to be downloaded.
 *
 * @return MHD_YES if the response was queued successfully, MHD_NO otherwise.
 *
 * @throws Error If there's an issue opening the file, allocating memory for reading the file's
 * contents, or creating the HTTP response.
 */
int download_file(struct MHD_Connection *connection, const char *file_path)
{
    // printf("Called download_file with file_path: %s\n", file_path);

    FILE *file = fopen(file_path, "rb");
    if (!file)
    {
        perror("Failed to open file");
        return MHD_NO;
    }

    fseek(file, 0, SEEK_END);
    long file_size = ftell(file);
    fseek(file, 0, SEEK_SET);

    char *buffer = malloc(file_size);
    if (!buffer)
    {
        perror("Failed to allocate memory");
        fclose(file);
        return MHD_NO;
    }

    fread(buffer, 1, file_size, file);
    fclose(file); // We can close the file now, as we have its contents in memory.

    struct MHD_Response *response = MHD_create_response_from_buffer(file_size, buffer, MHD_RESPMEM_MUST_FREE);
    if (!response)
    {
        // printf("Failed to create response\n");
        free(buffer);
        return MHD_NO;
    }

    MHD_add_response_header(response, "Content-Type", "application/octet-stream");
    MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");

    char content_disposition_header[256];
    snprintf(content_disposition_header, sizeof(content_disposition_header), "attachment; filename=\"%s\"", strrchr(file_path, '/') + 1);
    MHD_add_response_header(response, "Content-Disposition", content_disposition_header);

    int ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
    MHD_destroy_response(response);

    return ret;
}

/**
 * @brief Retrieves file names from a specified directory.
 *
 * This function iterates through the given directory and constructs a JSON-like string containing
 * all file names. If the directory cannot be read or has no files, an empty JSON array ("[]") is returned.
 *
 * @param directoryPath Path to the directory from which file names should be retrieved.
 *
 * @return A dynamically-allocated string containing file names in a JSON-like array format.
 * The caller is responsible for freeing the returned string using `free()`. Returns NULL in case of errors.
 *
 * @throws Error If there's an issue allocating memory or opening the directory.
 */
char *getFilesFromDirectory(const char *directoryPath)
{
    DIR *d;
    struct dirent *dir;
    char *output = malloc(4096); // Memory allocation, might wanna to handle resizing if the directory has many files
    
    if (!output)
        return NULL;
    strcpy(output, "[");

    d = opendir(directoryPath);
    if (d)
    {
        int first = 1;
        while ((dir = readdir(d)) != NULL)
        {
            if (dir->d_type == DT_REG)
            { // Check if it's a file
                if (!first)
                {
                    strcat(output, ", ");
                }
                strcat(output, "\"");
                strcat(output, dir->d_name);
                strcat(output, "\"");
                first = 0;
            }
        }
        closedir(d);
    }
    strcat(output, "]");
    return output;
}

/**
 * @brief Handles the termination of a process and its child processes via a Python script.
 *
 * This function runs a Python script that terminates a process based on its PID and all its child processes.
 * It then reads the output of the script and stores it in the provided output buffer.
 *
 * @param pid The Process ID of the target process to be killed.
 * @param output Buffer to store the output of the kill operation. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If there's an issue running the python script.
 */
void handle_kill_tree(const char *pid, char *output, size_t output_size)
{
    // Error checking for null PID
    if (pid == NULL)
    {
        strncpy(output, "Error: PID is NULL\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error: PID is NULL\n");
        return;
    }

    // command to run the python script with the PID as an argument
    char command[256];
    // printf("PID value is: %s\n", pid);
    snprintf(command, sizeof(command), "../venv/bin/python3 ../scripts/python/sig_tree_kill.py %s", pid);

    // Open a pipe to a command line process and execute the command
    FILE *fp = popen(command, "r");

    // error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // reading the output from the python script
    while (fgets(output, output_size, fp) != NULL)
    {
        // ensuring null-termination after reading output
        output[strlen(output) - 1] = '\0';
    }

    // log success
    // printf("Successfully executed command: %s\n\n\n", command);

    // closing the file pointer
    pclose(fp);
}

/**
 * @brief Handles the execution of a SYN flood attack via a Python script and stores the result.
 *
 * This function runs a Python script that performs a SYN flood attack on the provided target IP and port.
 * It then reads the output of the attack and stores it in the provided output buffer.
 *
 * @note To make the function run, it might be necessary to adjust permissions: sudo chmod o+rw /dev/bpf*
 *
 * @param target_ip The IP address of the target for the SYN flood attack. Must not be NULL.
 * @param target_port The port of the target for the SYN flood attack.
 * @param mac_address The MAC address for the flooding.
 * @param output Buffer to store the output of the attack. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If the target_ip is NULL.
 * @throws Error If there's an issue constructing the command string.
 * @throws Error If there's an issue running the python script.
 */
pid_t handle_SYNflood(const char *target_ip, int target_port, const char *mac_address, char *output, size_t output_size)
{
    // Error checking for null target_ip arg
    if (target_ip == NULL)
    {
        strncpy(output, "Error: target is NULL\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error: target is NULL\n");
        return -1; // error
    }

    // add to docs need to handle
    // to make it run - sudo chmod o+rw /dev/bpf*

    // command to run the python script with args
    // using snprintf to avoid buffer overflow
    char command[256];
    const char *wrapperPath = "./wrapper";
    const char *scriptPath = "../scripts/python/flood_tool.py";

    // // printf("Target ip is: %s\n", target_ip);
    // // printf("Target port is: %d\n", target_port);
    // // printf("macaddress: %s\n", mac_address);

    // Create the command that uses the wrapper to execute the script command
    if (snprintf(command, sizeof(command), "%s %s %s %d %s",
                 wrapperPath, scriptPath, target_ip, target_port, mac_address) >= sizeof(command))
    {
        strncpy(output, "Error creating command string\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error creating command string\n");
        return -1; // error
    }

    pid_t pid;
    if ((pid = fork()) == 0)
    {
        // child process
        execl("/bin/sh", "sh", "-c", command, NULL);
        // If execl fails
        perror("execl failed");
        exit(EXIT_FAILURE);
    }
    else if (pid < 0)
    {
        // error
        // printf("Error occured while forking.\n");
        return -1; // error
    }
    else
    {
        // V parent procesu
        // printf("Flood PID is: %d\n", pid);
        return pid;
    }
}

/**
 * @brief Handles the execution of an nmap scan via a Python script and stores the result.
 *
 * This function runs a Python script that performs an nmap scan on the provided target.
 * It then reads the output of the scan and stores it in the provided output buffer.
 *
 * @param target The IP address or hostname of the target for the nmap scan. Must not be NULL.
 * @param output Buffer to store the output of the nmap scan. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If the target is NULL.
 * @throws Error If there's an issue running the python script.
 */
void handle_nmap(const char *target, char *output, size_t output_size)
{
    // Error checking for null password
    if (target == NULL)
    {
        strncpy(output, "Error: target is NULL\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error: target is NULL\n");
        return;
    }

    // command to run the python script with the password as an argument
    char command[256];
    // printf("Target value is: %s\n", target);
    snprintf(command, sizeof(command), "../venv/bin/python3 ../scripts/python/nmap_scan.py %s", target);

    // Open a pipe to a command line process and execute the command
    FILE *fp = popen(command, "r");

    // error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // reading the output from the python script
    while (fgets(output, output_size, fp) != NULL)
    {
        // ensuring null-termination after reading output
        output[strlen(output) - 1] = '\0';
    }

    // log success
    // printf("Successfully executed command: %s\n\n\n", command);

    // closing the file pointer
    pclose(fp);
}

/**
 * @brief Handles the execution of a ping command via a Python script and stores the result.
 *
 * This function runs a Python script that sends ICMP echo requests to the provided IP address.
 * It then reads the response and stores it in the provided output buffer.
 *
 * @param target_ip The IP address to ping. Must not be NULL.
 * @param output Buffer to store the ping response. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If the target_ip is NULL.
 * @throws Error If there's an issue running the python script.
 */
void handlePing(const char *target_ip, char *output, size_t output_size)
{
    // Error checking for null target IP
    if (target_ip == NULL)
    {
        strncpy(output, "Error: target IP is NULL\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error: target IP is NULL\n");
        return;
    }

    // Command to run the python script with the target IP as an argument
    char command[256];
    // printf("Target IP is: %s\n", target_ip);
    snprintf(command, sizeof(command), "python3 icmp.py %s", target_ip);
    snprintf(command, sizeof(command), "../venv/bin/python3 ../scripts/python/icmp.py %s", target_ip);

    // Open a pipe to a command line process and execute the command
    FILE *fp = popen(command, "r");

    // Error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // Reading the output from the python script
    while (fgets(output, output_size, fp) != NULL)
    {
        // Ensuring null-termination after reading output
        output[strlen(output) - 1] = '\0';
    }

    // Log success
    // printf("Successfully executed command: %s\n\n\n", command);

    // Closing the file pointer
    pclose(fp);
}

/**
 * @brief Handles the execution of a brute force request via a Python script and stores the result.
 *
 * This function runs a Python script that performs a brute force attack using the provided password.
 * It then reads the output of the attack and stores it in the provided output buffer.
 *
 * @param password The password to be used for the brute force attack. Must not be NULL.
 * @param output Buffer to store the output of the attack. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If the password is NULL.
 * @throws Error If there's an issue running the python script.
 */
void handle_brute_force_request(const char *password, char *output, size_t output_size)
{
    // Error checking for null password
    if (password == NULL)
    {
        strncpy(output, "Error: password is NULL\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error: password is NULL\n");
        return;
    }

    // command to run the python script with the password as an argument
    // using snprintf to avoid buffer overflow
    char command[256];
    snprintf(command, sizeof(command), "python3 ../scripts/python/brute_force.py \"%s\"", password);

    // Open a pipe to a command line process and execute the command
    FILE *fp = popen(command, "r");

    // error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // reading the output from the python script
    while (fgets(output, output_size, fp) != NULL)
    {
        // ensuring null-termination after reading output
        output[strlen(output) - 1] = '\0';
    }

    // log success
    // printf("Successfully executed command: %s\n\n\n", command);

    // closing the file pointer
    pclose(fp);
}

/**
 * @brief Handles the execution of a brute ARP request via a Python script and stores the result.
 *
 * This function runs a Python script that performs an ARP spoofing attack.
 * It then reads the output of the attack and stores it in the provided output buffer.
 *
 * @param output Buffer to store the output of the ARP attack. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If there's an issue constructing the command string.
 * @throws Error If there's an issue running the python script.
 */
void handle_bruteARP(char *output, size_t output_size)
{
    // wrapper loc
    // hacky way to run script as sudo
    const char *wrapperPath = "./wrapper"; //
    // const char *scriptPath = "sudo ../scripts/python/arp_spoofing.py";
    const char *scriptPath = "../scripts/python/arp_spoofing.py";
    char command[256];

    // check
    if (snprintf(command, sizeof(command), "%s %s", wrapperPath, scriptPath) >= sizeof(command))
    {
        strncpy(output, "Error creating command string\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error creating command string\n");
        return;
    }

    // open a pipe to a command line process and execute the command
    FILE *fp = popen(command, "r");

    // error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // reading the output from the python script
    while (fgets(output, output_size, fp) != NULL)
    {
        // ensuring null-termination after reading output
        output[strlen(output) - 1] = '\0';
    }

    // get the commands exit status
    int exit_status = pclose(fp);

    if (exit_status == 0)
    {
        // log success
        // printf("Successfully executed command: %s\n\n\n", command);
    }
    else
    {
        // Log failure
        // printf("Command failed with exit status %d\n\n\n", exit_status);
    }
}

/**
 * @brief Executes a given shell command and captures its output.
 *
 * This function runs a given command in the shell and captures its standard output.
 * The output is then stored in the provided output buffer.
 *
 * @param cmd The shell command to be executed. Must not be NULL.
 * @param output Buffer to store the captured output of the command. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If there's an issue executing the command.
 * @throws Error If the output of the command exceeds the provided buffer size.
 */
void execute_command(const char *cmd, char *output, size_t output_size)
{
    // open a pipe and execute the command
    FILE *pipe = popen(cmd, "r");
    if (!pipe)
    {
        // handle error
        strncpy(output, "Error executing command", output_size - 1);
        return;
    }

    char buffer[256];
    size_t output_len = 0;
    // read the output of the command line by line
    while (fgets(buffer, sizeof(buffer), pipe) != NULL)
    {
        size_t buffer_len = strlen(buffer);
        // Ensure we don't overflow the output buffer
        if (output_len + buffer_len >= output_size - 1)
        {
            break;
        }
        // concatenate the line to the output
        strcat(output, buffer);
        output_len += buffer_len;
    }

    pclose(pipe);
}

/**
 * @brief Executes a Python script to run the 'top' command and stores the result.
 *
 * This function runs a Python script that executes the 'top' command.
 * It then reads the output of the command and stores it in the provided output buffer.
 *
 * @param output Buffer to store the output of the 'top' command. Must have enough space as defined by output_size.
 * @param output_size Size of the output buffer.
 *
 * @throws Error If there's an issue constructing the command string.
 * @throws Error If there's an issue running the python script.
 */
void handle_top(char *output, size_t output_size)
{
    // Path to the Python script
    const char *scriptPath = "../scripts/python/top.py";
    char command[256];

    // Constructing the command string
    if (snprintf(command, sizeof(command), "../venv/bin/python3 %s", scriptPath) >= sizeof(command))
    {
        strncpy(output, "Error creating command string\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error creating command string\n");
        return;
    }

    // printf("Attempting to run command: %s\n", command);
    FILE *fp = popen(command, "r");

    // Error handling if file pointer is NULL
    if (fp == NULL)
    {
        strncpy(output, "Error running python script\n", output_size - 1);
        output[output_size - 1] = '\0'; // Ensuring null-termination
        // printf("Error running python script\n");
        return;
    }

    // Temporary buffer to store each line of output
    char buffer[256];
    size_t total_size = 0;

    // Reading the output from the python script
    while (fgets(buffer, sizeof(buffer), fp) != NULL)
    {
        size_t len = strlen(buffer);
        if (total_size + len < output_size) // Ensure we don't overflow the output buffer
        {
            strcpy(output + total_size, buffer); // Append the new line to output
            total_size += len;                   // Update the total size
        }
        else
        {
            // printf("Output buffer is full\n");
            break;
        }
    }

    // Null terminate the output string
    output[total_size] = '\0';

    // Get the command's exit status
    int exit_status = pclose(fp);
    // printf("Command execution completed with exit status: %d\n", exit_status);

    if (exit_status == 0)
    {
        // Log success
        // printf("Successfully executed command: %s\n\n\n", command);
    }
    else
    {
        // Log failure
        // printf("Command failed with exit status %d\n\n\n", exit_status);
    }
}

// char *json_escape(const char *input) {
//     // we expect doubled size for escaped string
//     char *escaped = malloc(strlen(input) * 2 + 1);
//     char *output = escaped;
//     if (!escaped) {
//         fprintf(stderr, "Memory allocation error\n");
//         return NULL;
//     }
//     while (*input) {
//         switch (*input) {
//             case '\b': *output++ = '\\'; *output++ = 'b'; break;
//             case '\f': *output++ = '\\'; *output++ = 'f'; break;
//             case '\n': *output++ = '\\'; *output++ = 'n'; break;
//             case '\r': *output++ = '\\'; *output++ = 'r'; break;
//             case '\t': *output++ = '\\'; *output++ = 't'; break;
//             case '\"': *output++ = '\\'; *output++ = '\"'; break;
//             case '\\': *output++ = '\\'; *output++ = '\\'; break;
//             default: *output++ = *input; break;
//         }
//         ++input;
//     }
//     *output = '\0';
//     return escaped;
// }

/**
 * @brief Runs a shell command with elevated privileges and captures the output.
 *
 * Uses a wrapper executable with setuid to execute a command as root and captures the output into a buffer.
 *
 * @param cmd Command to be executed, excluding the wrapper path.
 * @param output Pre-allocated buffer for command output.
 * @param output_size Size of the output buffer.
 *
 * @throws Error on execution failure or buffer overflow risk.
 */
void execute_command_HASHCAT(const char *cmd, char *output, size_t output_size)
{

    // printf("643 %s\n", cmd);

    char command[1024]; // Increase the buffer size for the full command if needed
    // const char *wrapperPath = "./wrapper_HASHCAT"; // Path to the wrapper
    const char *wrapperPath = "./wrapper_HASHCAT"; // Path to the wrapper

    // Create the command with the wrapper
    snprintf(command, sizeof(command), "%s %s", wrapperPath, cmd);

    // Open a pipe and execute the command
    FILE *pipe = popen(command, "r");
    if (!pipe)
    {
        // Handle error
        strncpy(output, "Error executing command", output_size - 1);
        output[output_size - 1] = '\0'; // Ensure null-termination
        return;
    }

    char buffer[256];
    size_t output_len = 0;
    // Read the command's output line by line
    while (fgets(buffer, sizeof(buffer), pipe) != NULL)
    {
        size_t buffer_len = strlen(buffer);
        // Ensure that the output buffer does not overflow
        if (output_len + buffer_len >= output_size - 1)
        {
            break;
        }
        // Concatenate the line to the output
        strcat(output, buffer);
        output_len += buffer_len;
    }

    // Close the pipe
    pclose(pipe);
}

// netcat
/**
 * @brief Runs a shell command with elevated privileges and captures the output.
 *
 * Uses a wrapper executable with setuid to execute a command as root and captures the output into a buffer.
 *
 * @param cmd Command to be executed, excluding the wrapper path.
 * @param output Pre-allocated buffer for command output.
 * @param output_size Size of the output buffer.
 *
 * @throws Error on execution failure or buffer overflow risk.
 */
void execute_command_NETCAT(const char *cmd, char *output, size_t output_size)
{
    // printf("697 %s\n", cmd);

    char command[1024];                            // Ensure the buffer size is sufficient for the full command
    const char *wrapperPath = "./wrapper_HASHCAT"; // Path to the wrapper

    // Construct the command with the wrapper, ensuring stderr is redirected to stdout
    snprintf(command, sizeof(command), "%s %s 2>&1", wrapperPath, cmd);

    // Open a pipe and execute the command
    FILE *pipe = popen(command, "r");
    if (!pipe)
    {
        // Handle error
        strncpy(output, "Error executing command", output_size - 1);
        output[output_size - 1] = '\0'; // Ensure null-termination
        return;
    }

    output[0] = '\0'; // Initialize the output buffer to be empty
    char buffer[256];
    // printf("717 \n");
    size_t output_len = 0;
    // Read the command's output line by line
    while (fgets(buffer, sizeof(buffer), pipe) != NULL)
    {
        // printf("Buffer before trim: '%s'\n", buffer); // For debugging purposes
        size_t buffer_len = strlen(buffer);
        // Ensure that the output buffer does not overflow
        if (output_len + buffer_len < output_size)
        {
            strcat(output, buffer); // Concatenate the line to the output
            output_len += buffer_len;
            output[output_len] = '\0'; // Ensure null-termination after each append
        }
        else
        {
            fprintf(stderr, "Warning: Output buffer is full. Some data may be truncated.\n");
            break;
        }
    }

    // printf("Output: '%s'\n", output); // For debugging purposes

    // Close the pipe
    pclose(pipe);
}

struct connection_info_struct
{
    char *data;
    size_t data_size;
};

/**
 * @brief Handle incoming HTTP requests, process them, and send a response.
 *
 * This function is designed to manage different types of HTTP requests such as POST requests
 * to specific endpoints (e.g., /terminator, /brute_force_check, /brute_ARP, /nmap, /SYN_flood).
 * Depending on the request type and endpoint, it performs various tasks like parsing input data,
 * executing shell commands, and sending a response.
 *
 * @param cls A pointer to user-defined closure data (not used in this function).
 * @param connection The MHD_Connection structure provides details about the connection.
 * @param url The URL path of the incoming request.
 * @param method The HTTP method of the request (e.g., GET, POST).
 * @param version The HTTP version string.
 * @param upload_data Data uploaded in the POST request.
 * @param upload_data_size The size of the upload_data.
 * @param con_cls A pointer to the client-specific data, can be set in handler.
 *
 * @return MHD_YES if the connection was handled successfully, MHD_NO otherwise.
 *
 * @throws Error when the command execution fails or memory allocation issues occur.
 * @throws Error when the request method or URL is not as expected.
 *
 * @note This function uses several helper functions to handle specific tasks like `execute_command`
 *       for running shell commands and `handle_brute_force_request` for handling brute force requests etc.
 */
static enum MHD_Result answer_to_connection(void *cls, struct MHD_Connection *connection,
                                            const char *url, const char *method,
                                            const char *version, const char *upload_data,
                                            size_t *upload_data_size, void **con_cls)
{

    // Handling the OPTIONS request at the beginning of the function.
    if (strcmp(method, "OPTIONS") == 0)
    {
        struct MHD_Response *response;
        int ret;

        // printf("options\n");

        response = MHD_create_response_from_buffer(0, NULL, MHD_RESPMEM_PERSISTENT);
        // MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
        // MHD_add_response_header(response, "Access-Control-Allow-Methods", "POST, GET, OPTIONS");

        // printf("Adding headers...\n");
        MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
        MHD_add_response_header(response, "Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        MHD_add_response_header(response, "Access-Control-Allow-Headers", "Content-Type");
        // printf("Headers added.\n");

        ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
        MHD_destroy_response(response);

        return ret;
    }

    // POST /terminator
    if (strcmp(method, "POST") == 0 && strcmp(url, "/terminator") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {
                // print the received data
                // // printf("Received data: %s\n", con_info->data);

                // parse the command from the received data
                char command[256];
                sscanf(con_info->data, "{ \"command\": \"%255[^\"]\" }", command);

                // printf("%s\n", command);

                // define response size and set/init all elements to zero
                char output[32768] = {0};
                // exe cmnd in shell
                execute_command(command, output, sizeof(output));

                // response prep
                char page[32768];
                snprintf(page, sizeof(page), "{\"output\":\"%s\"}", output);
                // printf("%s output terminator api\n", output);

                struct MHD_Response *response;
                int ret;

                // create response
                response = MHD_create_response_from_buffer(strlen(page), (void *)page, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;

                return ret;
            }
        }
    }

    // POST /brute_force // check pw
    if (strcmp(method, "POST") == 0 && strcmp(url, "/brute_force_check") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if there is data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {

                // // printf("Received a POST request on /brute_force\n"); // log the incoming request

                // log the received data
                // // printf("Received data: %s\n", con_info->data);

                // parse the command from the received data
                char command[256];
                sscanf(con_info->data, "{ \"password\": \"%255[^\"]\" }", command);

                // log the extracted command
                // // printf("Extracted command: %s\n", command);

                // buffer to store output
                char output[MAXDATASIZE] = {0};

                // handle the brute force request and store the output
                handle_brute_force_request(command, output, sizeof(output));

                // log the output
                // // printf("Output from handle_brute_force_request: %s\n", output);

                // creating the response
                struct MHD_Response *response;
                int ret;

                // sending the response back with the output from the python script
                response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    // fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    // fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;
                return ret;
            }
        }
    }

    // POST /brute_ARP
    if (strcmp(method, "POST") == 0 && strcmp(url, "/brute_ARP") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if there is data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {

                // printf("Received a POST request on /brute_ARP\n\n"); // log the incoming request

                // log the received data
                // printf("202 this should be empty - Received data: %s\n\n", con_info->data);

                // log the extracted command
                // printf("Extracted command: [no parameters]\n\n");

                // buffer to store output
                char output[MAXDATASIZE] = {0};

                // handle the bruteARP and store the output
                handle_bruteARP(output, sizeof(output));

                // log the output
                // printf("Output from BRUTE ART: %s\n", output);

                // creating the response
                struct MHD_Response *response;
                int ret;

                // sending the response back with the output from the python script
                response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;
                return ret;
            }
        }
    }

    // POST /nmap
    if (strcmp(method, "POST") == 0 && strcmp(url, "/nmap") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if there is data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {

                // printf("Received a POST request on /nmap\n"); // log the incoming request

                // log the received data
                // printf("Received data: %s\n", con_info->data);

                // parse the command from the received data
                char command[256];
                sscanf(con_info->data, "{ \"target\": \"%255[^\"]\" }", command);

                // log the extracted command
                // printf("Extracted command: %s\n", command);

                // buffer to store output
                char output[MAXDATASIZE] = {0};

                // handle the brute force request and store the output
                handle_nmap(command, output, sizeof(output));

                // log the output
                // printf("Output from handle nmpa: %s\n", output);

                // creating the response
                struct MHD_Response *response;
                int ret;

                // sending the response back with the output from the python script
                response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;
                return ret;
            }
        }
    }

    // POST /SYN, ICMP flood
    if (strcmp(method, "POST") == 0 && strcmp(url, "/SYN_flood") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if there is data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {

                // printf("Received a POST request on /SYN_flood\n"); // log the incoming request

                // log the received data
                // printf("Received data: %s\n", con_info->data);

                char target_ip[16];      // ipv4 address
                char target_port_str[6]; // buffer pro port jako string (max 5 chars + null terminator)
                char mac_address[MAC_ADDRESS_LENGTH];
                char output[MAXDATASIZE] = {0};
                int target_port;
                char pid_string[20];

                int parsed_items = sscanf(con_info->data,
                                          "{ \"target_ip\":\"%15[^\"]\",\"target_port\":\"%5[^\"]\",\"mac_address\":\"%17[^\"]\" }",
                                          target_ip, target_port_str, mac_address);

                // args check
                if (parsed_items == 3)
                {
                    target_port = atoi(target_port_str);
                    // printf("parsed success: %s, %d, %s\n", target_ip, target_port, mac_address);

                    // exe SYN flood and get the PID
                    pid_t flood_pid = handle_SYNflood(target_ip, target_port, mac_address, output, sizeof(output));

                    // convert PID to string
                    snprintf(pid_string, sizeof(pid_string), "%d", flood_pid);

                    // log the output
                    // printf("output from syn flood: %s\n", output);
                }
                else
                {
                    // printf("parsing has failed %d parsed items\n", parsed_items);
                }

                // creating the response
                struct MHD_Response *response;
                int ret;

                char json_response[MAXDATASIZE];
                snprintf(json_response, sizeof(json_response), "{\"output\":\"%s\", \"pid\":\"%s\"}", output, pid_string);

                // // printf("JSON response: %s\n", json_response);
                // printf("JSON response: %s\n", json_response);

                response = MHD_create_response_from_buffer(strlen(json_response), (void *)json_response, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;
                return ret;
            }
        }
    }

    // icmp ping
    if (strcmp(method, "POST") == 0 && strcmp(url, "/ping") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if there is data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {

                // printf("Received a POST request on /ping\n"); // log the incoming request

                // log the received data
                // printf("Received data: %s\n", con_info->data);

                // parse the IP address from the received data
                char ip_address[16];
                sscanf(con_info->data, "{ \"ip\": \"%15[^\"]\" }", ip_address);

                // log the extracted IP address
                // printf("Extracted IP address: %s\n", ip_address);

                // buffer to store output
                char output[MAXDATASIZE] = {0};

                // handle the ping request and store the output
                handlePing(ip_address, output, sizeof(output));

                // log the output
                // printf("Output from handlePing: %s\n", output);

                // creating the response
                struct MHD_Response *response;
                int ret;

                // sending the response back with the output from the python script
                response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;
                return ret;
            }
        }
    }

    if (strcmp(method, "POST") == 0 && strcmp(url, "/sigkill") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else if (con_info->data != NULL && con_info->data_size > 0)
        {
            // printf("Received a POST request on /kill_process\n"); // log the incoming request

            // log the received data
            // printf("Received data: %s\n", con_info->data);

            // parse the PID from the received data
            char process_pid[10];
            sscanf(con_info->data, "{ \"pid\": \"%9[^\"]\" }", process_pid);

            // log the extracted PID
            // printf("Extracted PID: %s\n", process_pid);

            // buffer to store output
            char output[MAXDATASIZE] = {0};

            // handle the process termination request and store the output
            handle_kill_tree(process_pid, output, sizeof(output));

            // creating the response
            struct MHD_Response *response;
            int ret;

            // sending the response back with the output from the function
            response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);
            if (response == NULL)
            {
                fprintf(stderr, "Error creating response\n");
                return MHD_NO;
            }

            MHD_add_response_header(response, "Content-Type", "application/json");
            MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
            ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

            if (ret == MHD_NO)
            {
                fprintf(stderr, "Error sending response\n");
            }

            MHD_destroy_response(response);
            free(con_info->data);
            free(con_info);
            *con_cls = NULL;
            return ret;
        }
    }

    if (strcmp(method, "POST") == 0 && strcmp(url, "/top") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else if (con_info->data != NULL && con_info->data_size > 0)
        {
            // printf("Received a POST request on /top\n"); // log the incoming request

            // log the received data
            // // printf("Received data: %s\n", con_info->data);

            // parse the PID from the received data
            // char process_pid[10];
            // sscanf(con_info->data, "{ \"pid\": \"%9[^\"]\" }", process_pid);

            // log the extracted PID
            // // printf("Extracted PID: %s\n", process_pid);

            // buffer to store output
            char output[MAXDATASIZE] = {0};

            // printf("1217, before run top.py\n");

            // handle the process termination request and store the output
            handle_top(output, sizeof(output));

            // creating the response
            struct MHD_Response *response;
            int ret;

            // sending the response back with the output from the function
            response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_COPY);
            if (response == NULL)
            {
                fprintf(stderr, "Error creating response\n");
                return MHD_NO;
            }

            MHD_add_response_header(response, "Content-Type", "application/json");
            MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
            ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

            if (ret == MHD_NO)
            {
                fprintf(stderr, "Error sending response\n");
            }

            MHD_destroy_response(response);
            free(con_info->data);
            free(con_info);
            *con_cls = NULL;
            return ret;
        }
    }

    // files
    if (strcmp(method, "POST") == 0 && strcmp(url, "/filesList") == 0)
    {

        // printf("1318");

        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info = malloc(sizeof(struct connection_info_struct));
            if (!con_info)
                return MHD_NO; // Allocation failure.

            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // Handle uploaded data, if present.
        if (*upload_data_size != 0)
        {
            char *new_data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!new_data)
                return MHD_NO; // Allocation failure.

            con_info->data = new_data;
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }

        if (con_info->data != NULL && con_info->data_size > 0)
        {
            // printf("Received a POST request on /buffet\n");

            // Get the list of files from the directory
            char *output = getFilesFromDirectory("../buffet_binary");
            if (!output)
            {
                fprintf(stderr, "Error retrieving files from directory\n");
                return MHD_NO;
            }

            // printf("%s\n\n", output);

            struct MHD_Response *response = MHD_create_response_from_buffer(strlen(output), (void *)output, MHD_RESPMEM_MUST_FREE); // Note: Use MHD_RESPMEM_MUST_FREE to free the memory once sent
            if (!response)
            {
                free(output);
                fprintf(stderr, "Error creating response\n");
                return MHD_NO;
            }

            MHD_add_response_header(response, "Content-Type", "application/json");
            MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
            int ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

            if (ret == MHD_NO)
            {
                fprintf(stderr, "Error sending response\n");
            }

            MHD_destroy_response(response);
            free(con_info->data);
            free(con_info);
            *con_cls = NULL;
            return ret;
        }
    }

    // download file
    if (strcmp(method, "POST") == 0 && strcmp(url, "/dFile") == 0)
    {
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            if (!con_info)
            {
                return MHD_NO;
            }
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        // printf("1446\n");

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            char *temp = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!temp) // Kontrola realokace paměti
            {
                free(con_info->data);
                free(con_info);
                return MHD_NO;
            }
            con_info->data = temp;
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            if (con_info->data != NULL && con_info->data_size > 0)
            {
                char file_name[256];
                if (sscanf(con_info->data, "{ \"name\": \"%255[^\"]\" }", file_name) != 1) // Kontrola návratové hodnoty sscanf
                {
                    free(con_info->data);
                    free(con_info);
                    return MHD_NO;
                }

                char file_path[PATH_MAX];
                snprintf(file_path, PATH_MAX, "../buffet_binary/%s", file_name);

                // printf("%s\n", file_path);
                int ret = download_file(connection, file_path);

                free(con_info->data);
                free(con_info);
                // printf("1537\n");
                *con_cls = NULL;

                return ret;
            }
        }
    }

    // is server up ?
    if (strcmp(method, "GET") == 0 && strcmp(url, "/status") == 0)
    {
        int ret;
        const char *response_body = "{\"status\":\"yo, server is UP - running port 8080\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(response_body), (void *)response_body, MHD_RESPMEM_MUST_COPY);

        if (response == NULL)
        {
            fprintf(stderr, "Error creating status response\n");
            return MHD_NO;
        }

        MHD_add_response_header(response, "Content-Type", "application/json");
        MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
        ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
        MHD_destroy_response(response);
        return ret;
    }

    // POST /hashcat
    if (strcmp(method, "POST") == 0 && strcmp(url, "/hashcat") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {
                // print the received data
                // printf("Received data: %s\n", con_info->data);

                // parse the command from the received data
                char command[256];
                sscanf(con_info->data, "{ \"command\": \"%255[^\"]\" }", command);

                // printf("%s\n", command);
                // printf("%s\n", command);

                // define response size and set/init all elements to zero
                char output[32768] = {0};
                // exe cmnd in shell
                execute_command_HASHCAT(command, output, sizeof(output));

                // response prep
                char page[32768];
                snprintf(page, sizeof(page), "{\"output\":\"%s\"}", output);
                // printf("%s\n", output);

                struct MHD_Response *response;
                int ret;

                // create response
                response = MHD_create_response_from_buffer(strlen(page), (void *)page, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;

                return ret;
            }
        }
    }

    // POST /echo
    if (strcmp(method, "POST") == 0 && strcmp(url, "/echo") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {
                // print the received data
                // printf("Received data: %s\n", con_info->data);
                // printf("Received data: %s\n", con_info->data);

                // // parse the command from the received data
                // char command[256];
                // sscanf(con_info->data, "{ \"command\": \"%255[^\"]\" }", command);

                // // printf("%s\n", command);
                // // printf("%s\n", command);

                // printf("1750");

                json_error_t error;
                json_t *root = json_loads(con_info->data, 0, &error);

                if (!root)
                {
                    fprintf(stderr, "Error parsing JSON: %s\n", error.text);
                    return MHD_NO;
                }

                // get value from key command
                json_t *json_command = json_object_get(root, "command");
                if (!json_command || !json_is_string(json_command))
                {
                    fprintf(stderr, "Error: command is not a string\n");
                    json_decref(root);
                    return MHD_NO;
                }

                const char *command_text = json_string_value(json_command);
                // printf("commant text %s\n", command_text);

                // define response size and set/init all elements to zero
                char output[32768] = {0};
                // exe cmnd in shell
                execute_command_HASHCAT(command_text, output, sizeof(output));

                // response prep
                char page[32768];
                snprintf(page, sizeof(page), "{\"output\":\"%s\"}", output);
                // printf("%s\n", output);

                struct MHD_Response *response;
                int ret;

                // create response
                response = MHD_create_response_from_buffer(strlen(page), (void *)page, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;

                return ret;
            }
        }
    }

    // POST /echo
    if (strcmp(method, "POST") == 0 && strcmp(url, "/netcat") == 0)
    {
        // on first call for each connection, initialize connection_info_struct
        if (*con_cls == NULL)
        {
            struct connection_info_struct *con_info;
            con_info = malloc(sizeof(struct connection_info_struct));
            con_info->data = NULL;
            con_info->data_size = 0;
            *con_cls = con_info;
            return MHD_YES;
        }

        struct connection_info_struct *con_info = *con_cls;

        // if there is uploaded data
        if (*upload_data_size != 0)
        {
            // reallocate buffer and append uploaded data
            con_info->data = realloc(con_info->data, con_info->data_size + *upload_data_size + 1);
            if (!con_info->data)
            {
                // handle allocation failure
                return MHD_NO;
            }
            strncat(con_info->data, upload_data, *upload_data_size);
            con_info->data_size += *upload_data_size;
            *upload_data_size = 0;
            return MHD_YES;
        }
        else
        {
            // if data to process
            if (con_info->data != NULL && con_info->data_size > 0)
            {
                // print the received data
                // printf("Received data: %s\n", con_info->data);
                // printf("Received data: %s\n", con_info->data);

                // // parse the command from the received data
                // char command[256];
                // sscanf(con_info->data, "{ \"command\": \"%255[^\"]\" }", command);

                // // printf("%s\n", command);
                // // printf("%s\n", command);

                // printf("1750");

                json_error_t error;
                json_t *root = json_loads(con_info->data, 0, &error);

                if (!root)
                {
                    fprintf(stderr, "Error parsing JSON: %s\n", error.text);
                    return MHD_NO;
                }

                // get value from key command
                json_t *json_command = json_object_get(root, "command");
                if (!json_command || !json_is_string(json_command))
                {
                    fprintf(stderr, "Error: command is not a string\n");
                    json_decref(root);
                    return MHD_NO;
                }

                const char *command_text = json_string_value(json_command);
                // printf("commant text %s\n", command_text);

                // define response size and set/init all elements to zero
                char output[32768] = {0};
                // printf("1941\n");
                // exe cmnd in shell
                execute_command_NETCAT(command_text, output, sizeof(output));

                // printf("1942\n");

                // response prep
                char page[32768];
                snprintf(page, sizeof(page), "{\"output\":\"%s\"}", output);
                // printf("output %s\n", output);
                // printf("page %s\n", page);

                struct MHD_Response *response;
                int ret;

                // create response
                response = MHD_create_response_from_buffer(strlen(page), (void *)page, MHD_RESPMEM_MUST_COPY);

                if (response == NULL)
                {
                    fprintf(stderr, "Error creating response\n");
                    return MHD_NO;
                }

                MHD_add_response_header(response, "Content-Type", "application/json");
                MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
                ret = MHD_queue_response(connection, MHD_HTTP_OK, response);

                if (ret == MHD_NO)
                {
                    fprintf(stderr, "Error sending response\n");
                }

                MHD_destroy_response(response);
                free(con_info->data);
                free(con_info);
                *con_cls = NULL;

                return ret;
            }
        }
    }

    return MHD_YES;
}

int main()
{
    struct MHD_Daemon *daemon;

    // start the http daemon on port 8080
    daemon = MHD_start_daemon(MHD_USE_SELECT_INTERNALLY, 8080, NULL, NULL,
                              &answer_to_connection, NULL, MHD_OPTION_END);
    if (NULL == daemon)
    {
        // handle error
        return 1;
    }

    getchar();

    // stop the http daemon
    MHD_stop_daemon(daemon);

    return 0;
}