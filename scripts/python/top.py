"""
Description:
    A Python script that executes a specified top command in the terminal using the subprocess module.
    The script captures the standard output and standard error, and prints them to the console.
    If the command execution fails, it captures and prints the error.

Maintainer:
            ::::  ::::::::::::
            :+:     :+:    :+:
            +:+     +:+    +:+
            +#+     +#+    +:+
            +#+     +#+    +#+
        #+# #+#     #+#    #+#
         #####    ############

Date:
    Oct 19, 2023

Usage:
    python script_name.py

Dependencies:
    - subprocess module (native to Python standard library)

Notes:
    Ensure that the command to be executed is properly formatted and that the environment has the
    necessary permissions to execute the command.
"""

import subprocess
import json


def format_top_output(output):
    lines = output.strip().split('\n')[1:]
    processes = []
    for line in lines:
        columns = line.split()
        if len(columns) >= 12:
            process_info = {
                "PID": columns[0],
                "COMMAND": columns[1],
                "%CPU": columns[2],
                "TIME": columns[3],
                "#TH": columns[4],
                "#WQ": columns[5],
                "#PORT": columns[6],
                "MEM": columns[7],
                "PURG": columns[8],
                "CMPRS": columns[9],
                "PGRP": columns[10],
                "PPID": columns[11]
            }
            processes.append(process_info)
    return json.dumps(processes)


def execute_command(command):
    try:
        result = subprocess.run(command, shell=True,
                                check=True, text=True, capture_output=True)
        return format_top_output(result.stdout)
    except subprocess.CalledProcessError as e:
        return f'Error: {e}'


if __name__ == "__main__":
    command = 'top -l 1 -n 40'
    # command = 'top -l 1 -n 40 -o cpu'
    output = execute_command(command)
    print(output)
