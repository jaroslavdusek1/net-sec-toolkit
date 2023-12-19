allow_bpf_access binary file
 
description:
this script modifies the permissions of the Berkeley Packet Filter (BPF) devices files located in /dev/bpf* on unix like operating systems. BPF devices provide an interface not only for capturing but also for sending raw link-layer packets

BPF device files are crucial for tools and scripts that wish to send raw packets directly to a network interface, default restrictive perms on these devices prevent unauthorized apps from potentially harmful actions

usage:
before initiating tools or scripts that necessitate sending raw packets through BPF devices, run this script with root privileges "sudo ./allow_bpf_access", this will ensure the permissions are appropriately set
*once you restart your pc, perms are set back to default*

