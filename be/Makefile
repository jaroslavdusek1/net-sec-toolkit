# Překladač
CC = gcc

# Přepínače pro kompilátor 
CFLAGS = -Wall \
         -I/opt/homebrew/Cellar/libpq/16.0/include \
         -I/opt/homebrew/Cellar/jansson/2.14/include \
         -I/opt/homebrew/Cellar/libmicrohttpd/0.9.77/include

# Knihovny pro odkazování
LIBS = -L/opt/homebrew/Cellar/libpq/16.0/lib -lpq \
       -L/opt/homebrew/Cellar/jansson/2.14/lib -ljansson \
       -L/opt/homebrew/Cellar/libmicrohttpd/0.9.77/lib -lmicrohttpd

# Zdrojové soubory
SOURCES = database.c handlers.c main.c server.c utils.c

# Výstupní binární soubor
TARGET = server

all: $(TARGET)

$(TARGET): $(SOURCES)
	$(CC) $(CFLAGS) $(SOURCES) -o $(TARGET) $(LIBS)

clean:
	rm -f $(TARGET)
