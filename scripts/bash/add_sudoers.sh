#!/bin/bash

# macOs, linux

# script to add a command to the sudoers file which allows you to run commands without sudo pw

# Check if the script is run as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Automatically get the current logged in username
USERNAME=$(whoami)

# Specify the commands to be run without a password
COMMAND="/sbin/ifconfig"
COMMAND2="/usr/bin/python3 ../python/arp_spoofing.py"

# Add the configuration to the sudoers file
echo "$USERNAME ALL=(ALL:ALL) NOPASSWD: $COMMAND" >> /etc/sudoers
echo "$USERNAME ALL=(ALL:ALL) NOPASSWD: $COMMAND2" >> /etc/sudoers

# Output the result
echo "Added '$COMMAND' to sudoers file for user '$USERNAME' to be run without a password."
