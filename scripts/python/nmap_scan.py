#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Description:
    A Python script that leverages the nmap library to scan a specified target IP for open ports.
    The scan checks ports in the range of 1-200, and the results are presented with the port number
    and its state (e.g. open, closed).

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
    python3 script_name.py [target_ip]

Arguments:
    target_ip - The IP address of the host to be scanned.

Dependencies:
    - nmap library
    - argparse

Notes:
    For proper functionality, ensure the `nmap` binary is located in the specified path (`/opt/homebrew/bin/nmap`).
"""

import nmap
import argparse


def scan(target):
    nm = nmap.PortScanner(nmap_search_path=('/opt/homebrew/bin/nmap',))

    # scan_arguments = "-Pn -T4 -p 1-1000"
    scan_arguments = "-Pn -T4 -p 1-200"

    results = []
    try:
        nm.scan(hosts=target, arguments=scan_arguments)
        for host in nm.all_hosts():
            results.append(f"Host: {host}")
            for proto in nm[host].all_protocols():
                results.append(f"Protocol: {proto}")
                lport = list(nm[host][proto].keys())
                lport.sort()
                for port in lport:
                    results.append(
                        f"port: {port}\tstate: {nm[host][proto][port]['state']}")
    except Exception as e:
        results.append(f"Error: {str(e)}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="nmap tool")
    parser.add_argument("target", help="target host ip")
    args = parser.parse_args()

    result_list = scan(args.target)
    print(" | ".join(result_list))
