
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * @file
 * @brief Wrapper for executing Python scripts. Run a .py file as sudo without pw prompt.
 */

int main(int argc, char *argv[])
{
    if (argc < 2)
    {
        exit(EXIT_FAILURE);
    }

    char command[512] = {0};
    strncat(command, "python3 ", sizeof(command) - strlen(command) - 1);

    for (int i = 1; i < argc; ++i)
    {
        strncat(command, argv[i], sizeof(command) - strlen(command) - 1);
        if (i != argc - 1)
        {
            strncat(command, " ", sizeof(command) - strlen(command) - 1);
        }
    }

    system(command);
    return 0;
}

// setuid - set user ID upon execution
// sudo chown root:wheel wrapper
// sudo chmod u+s wrapper
// ls -l -rwsr-xr-x  1 root  wheel  33748  2 Oct 12:06 wrapper