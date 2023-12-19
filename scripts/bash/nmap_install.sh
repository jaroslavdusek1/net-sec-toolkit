#!/bin/bash

# macOs only // brew

# Script to check and install nmap on macOS

# Check if nmap is installed
if ! command -v nmap &> /dev/null
then
    echo "Nmap is not installed. Would you like to install it? (y/n)"
    read answer
    if [ "$answer" != "${answer#[Yy]}" ] ;then
        # Check if Homebrew is installed
        if ! command -v brew &> /dev/null
        then
            # Install Homebrew
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        # Install nmap
        brew install nmap
    else
        echo "Nmap is required for this tool. Exiting..."
        exit
    fi
fi
