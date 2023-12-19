1. ping_google_dns.c
    a c code file likely pinging google's dns server for network connectivity testing
2. fork_bomb_baby.c
    a c code file potentially containing a fork bomb, which can rapidly exhaust system resources when run
3. spoof_mac_linux.c
    a c code which manipulate with mac address, change it based on certain pattern 
    :::THIS CERTAIN FILE DOES NOT WORK ON MACOS:::






// IMPORTANT 
if you're having a running a file, especially on macOS, you might wanna give gatekeeper a little break.
gatekeeper is like macOS's watchdog, its making sure only the legit stuff gets a pass

if wanna bypass gatekeeper for a sec here's how
sudo spctl --master-disable
// go ahead and run your file
./<filename>
// enable back
sudo spctl --master-enable
