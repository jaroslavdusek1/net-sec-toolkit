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
