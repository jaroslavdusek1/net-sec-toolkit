# Compiler
CC = gcc

# Compiler Flags
CFLAGS = -Wall \
         -I/opt/homebrew/Cellar/libpq/16.0/include \
         -I/opt/homebrew/Cellar/jansson/2.14/include \
         -I/opt/homebrew/Cellar/libmicrohttpd/0.9.77/include

# Libraries for Linking
LIBS = -L/opt/homebrew/Cellar/libpq/16.0/lib -lpq \
       -L/opt/homebrew/Cellar/jansson/2.14/lib -ljansson \
       -L/opt/homebrew/Cellar/libmicrohttpd/0.9.77/lib -lmicrohttpd

# Source Files
SOURCES = database.c handlers.c main.c server.c utils.c

# Output Binary File
TARGET = server

all: $(TARGET)

$(TARGET): $(SOURCES)
	$(CC) $(CFLAGS) $(SOURCES) -o $(TARGET) $(LIBS)

clean:
	rm -f $(TARGET)
