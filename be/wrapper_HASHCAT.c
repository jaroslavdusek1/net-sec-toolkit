// #include <stdio.h>
// #include <stdlib.h>
// #include <string.h>
// #include <unistd.h>

// /**
//  * @file
//  * @brief Wrapper for executing scripts and commands. Runs a .py file with Python interpreter, others directly.
//  */

// int main(int argc, char *argv[]) {
//     if (argc < 2) {
//         fprintf(stderr, "Usage: %s <script_path or command> [args ...]\n", argv[0]);
//         exit(EXIT_FAILURE);
//     }

//     char command[512] = {0};
//     const char *pythonInterpreter = "python3"; // Specify path to the python interpreter if needed.
//     const char *fileExtension = strrchr(argv[1], '.'); // Get the file extension.

//     // Check if the file has a .py extension
//     if (fileExtension && strcmp(fileExtension, ".py") == 0) {
//         // Run as a Python script.
//         strncat(command, pythonInterpreter, sizeof(command) - strlen(command) - 1);
//         strncat(command, " ", sizeof(command) - strlen(command) - 1);
//     }

//     // Add the script path or command.
//     for (int i = 1; i < argc; ++i) {
//         strncat(command, argv[i], sizeof(command) - strlen(command) - 1);
//         if (i != argc - 1) {
//             strncat(command, " ", sizeof(command) - strlen(command) - 1);
//         }
//     }

//     // Check if we have rights to execute
//     if (access(command, X_OK) == -1) {
//         perror("Error: command not executable");
//         exit(EXIT_FAILURE);
//     }

//     // Execute the command
//     int result = system(command);
//     return result;
// }


// // setuid - set user ID upon execution
// // sudo chown root:wheel wrapper
// // sudo chmod u+s wrapper
// // ls -l -rwsr-xr-x  1 root  wheel  33748  2 Oct 12:06 wrapper


// old

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

/**
 * @brief Wrapper to execute given command with elevated privileges (as root).
 *
 * @param argc The argument count.
 * @param argv The argument vector, where argv[1] is the command to execute.
 * @return int The exit status of the command or the wrapper itself.
 */
int main(int argc, char *argv[])
{
    // Check if at least one argument is provided (the command to execute)
    if (argc < 2)
    {
        fprintf(stderr, "Usage: %s <command> [args...]\n", argv[0]);
        return EXIT_FAILURE;
    }

    // Construct the command to be executed
    char command[1024] = {0}; // Use a larger buffer if necessary
    for (int i = 1; i < argc; ++i)
    {
        // Concatenate arguments with spaces
        strncat(command, argv[i], sizeof(command) - strlen(command) - 1);
        if (i < argc - 1)
        {
            strncat(command, " ", sizeof(command) - strlen(command) - 1);
        }
    }

    // Execute the command using system call
    int ret = system(command);
    
    // Return the exit status of the system call
    return WEXITSTATUS(ret);
}

/*
to make the wrapper execute hashcat as root without a password prompt,
we need to set the setuid bit and change the owner to root

gcc wrapper_HASHCAT.c -o wrapper_HASHCAT
sudo chown root:wheel wrapper_HASHCAT
sudo chmod u+s wrapper_HASHCAT

allow other users to use this wrapper
chmod 4755 wrapper_HASHCAT

-rwsr-xr-x  1 root  staff  33828 Oct  8 13:56 wrapper
*/