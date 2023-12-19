#!/usr/bin/env python

"""
Description:
    A Python script that pings a provided IP address using the operating system's built-in 'ping' command.

Maintainer:    
            ::::  ::::::::::::  
            :+:     :+:    :+: 
            +:+     +:+    +:+ 
            +#+     +#+    +:+ 
            +#+     +#+    +#+ 
        #+# #+#     #+#    #+# 
         #####    ############ 

Date:
    Oct 14, 2023

Usage:
    python ping_script.py [IP_ADDRESS]

Dependencies:
    - os library

Notes:
    - Ensure you have the necessary permissions to execute the 'ping' command on your system.
    - This script assumes that the 'ping' utility is available on your system's PATH.
"""

import os
import sys


def ping_ip(ip_address):
    # 'ping -c 4' sends 4 packets
    response = os.system(f"ping -c 4 {ip_address}")
    if response == 0:
        print(f"{ip_address} is reachable.")
    else:
        print(f"{ip_address} is not reachable.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Provide me IP.")
    else:
        target_ip = sys.argv[1]

    ping_ip(target_ip)
