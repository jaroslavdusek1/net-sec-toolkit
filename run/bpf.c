#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <glob.h>

/**
 * @brief Program to modify permissions of /dev/bpf* files. Due to SYN flood .py script.
 *
 * Locates all files in the /dev directory with names starting with "bpf"
 * and ensures that these files are readable by everyone, but only writable
 * by their owner.
 */

int main()
{
    glob_t results;
    int ret;

    // locate all files matching the pattern /dev/bpf*
    ret = glob("/dev/bpf*", 0, NULL, &results);

    if (ret != 0)
    {
        perror("Error finding files");
        return 1;
    }

    for (size_t i = 0; i < results.gl_pathc; i++)
    {
        // set file permissions owner (read/write), group (read), others (read)
        if (chmod(results.gl_pathv[i], S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH) != 0)
        {
            perror("Failed to change file permissions");
            globfree(&results);
            return 1;
        }
    }

    // printf("File permissions successfully changed.\n");
    globfree(&results);
    return 0;
}