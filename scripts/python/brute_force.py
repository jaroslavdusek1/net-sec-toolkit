#!/usr/bin/env python

"""
Description:
    A Python script that performs a dictionary attack using the MD5 hashing algorithm. 
    It reads a list of potential passwords from a provided wordlist file and hashes each 
    password using MD5. It then compares this hash with the target hash. If a match is 
    found, it reports the password that matches the target hash.

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
    python script_name.py [target_password]

Dependencies:
    - os library
    - hashlib library
    - sys library
    - time library

Notes:
    - Ensure you have the 'passwords.txt' file in the directory above the script's directory.
    - The script assumes that the wordlist (passwords.txt) is in the parent directory of the script.
    - Ensure you use a secure hash function in production, as MD5 is considered cryptographically broken and unsuitable for further use.

"""

import os
import hashlib
import sys
import time

def md5_hash(string):
    return hashlib.md5(string.encode()).hexdigest()


def brute_force(target_hash, wordlist_file):
    start_time = time.time()
    with open(wordlist_file, 'r') as file:
        for line in file:
            word = line.strip()
            if md5_hash(word) == target_hash:
                end_time = time.time()
                return word, end_time - start_time
    end_time = time.time()
    return None, end_time - start_time


if __name__ == "__main__":
    target_hash = md5_hash(sys.argv[1])

    # get path to this file and file pws file
    script_dir = os.path.dirname(os.path.realpath(__file__))

    wordlist_file = os.path.join(script_dir, '../passwords.txt')

    result, time_taken = brute_force(target_hash, wordlist_file)

    if result:
        print(
            f"password: {result} has been cracked, it took only {time_taken:.10f} seconds")
    else:
        print("password was not found in the wordlist.")
