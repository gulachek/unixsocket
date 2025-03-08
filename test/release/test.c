#include <unixsocket.h>
#include <stdio.h>

int main() {
	// non-zero exit code if this fails
  return unix_socket() == -1;
}
