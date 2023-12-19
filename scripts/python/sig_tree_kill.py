"""
Description:
    This script finds and terminates a process and all its child processes based on the provided PID.

Maintainer:
            ::::  ::::::::::::  
            :+:     :+:    :+: 
            +:+     +:+    +:+ 
            +#+     +#+    +:+ 
            +#+     +#+    +#+ 
        #+# #+#     #+#    #+# 
         #####    ############     

Date:
    Oct 15, 2023

Usage:
    python3 kill_tree.py [pid]

Arguments:
    pid - The PID of the process you want to terminate along with its child processes.

Dependencies:
    - psutil

Notes:
    For proper functionality, the script may need to be run with superuser (root) privileges, 
    especially if the target process was started with elevated permissions.
"""

import psutil
import argparse


def kill_process_tree(pid):
    try:
        parent = psutil.Process(pid)
        children = parent.children(recursive=True)
        for child in children:
            child.terminate()
        parent.terminate()
        return "killed"
    except psutil.NoSuchProcess:
        return (f"No process with PID {pid} found.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kill process tree tool")
    parser.add_argument(
        "pid", type=int, help="The PID of the process to be terminated along with its children.")
    args = parser.parse_args()

    result = kill_process_tree(args.pid)
    print(result)
