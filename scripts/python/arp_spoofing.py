#!/usr/bin/env python

"""
Description:
    A Python script that uses the `arp` command to retrieve the ARP cache entries from the system.
    The script filters out entries with the "incomplete" status, formats the remaining entries, and
    then prints them in a structured manner.

Maintainer:    
            ::::  ::::::::::::  
            :+:     :+:    :+: 
            +:+     +:+    +:+ 
            +#+     +#+    +:+ 
            +#+     +#+    +#+ 
        #+# #+#     #+#    #+# 
         #####    ############ 

Date:
    Oct 05, 2023

Usage:
    python script_name.py

Dependencies:
    - os library

Notes:
    Ensure the environment has the appropriate permissions to execute system commands like `arp`.
"""

import os

# execute arp -a command
devices = []
for device in os.popen('arp -a | grep -v incomplete'): #exclude incomplete
    device = device.strip()
    if device:
        devices.append(device)

print(" | ".join(devices))

