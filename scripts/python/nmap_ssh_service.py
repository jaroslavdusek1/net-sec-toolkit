#! /usr/bin/bash env python3
# ipv4 address nmap scan
# basically i just need to know what port the ssh service is running on // probably 22 but y never know

import nmap


def scan_for_ssh(target):
    nm = nmap.PortScanner()
    # scan all port 1-65535
    nm.scan(hosts=target, arguments='-p-')

    results = [] 

    for host in nm.all_hosts():
        for proto in nm[host].all_protocols():
            lport = nm[host][proto].keys()
            for port in lport:
                # is on this port ssh check
                if 'name' in nm[host][proto][port] and nm[host][proto][port]['name'] == 'ssh':
                    result = f'SSH port found on host {host} ({nm[host].hostname()}): port {port}, state: {nm[host][proto][port]["state"]}'
                    results.append(result)  # append in results

    # print output
    print('\n'.join(results))


if __name__ == "__main__":
    target = input("Enter the target IP: ")
    scan_for_ssh(target)
