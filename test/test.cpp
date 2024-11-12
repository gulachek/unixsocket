#include "unixsocket.h"
#include <gtest/gtest.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

TEST(UnixSocket, ConnectCanStreamToBind) {
  int client = unix_socket();
  int server = unix_socket();
  const char *p = ".server.sock";

  unlink(p); // attempt to unlink previous socket

  int rc = unix_bind(server, p);
  ASSERT_EQ(rc, 0) << "Failed to bind server to " << p;
  listen(server, 2);

  unix_connect(client, p);

  struct sockaddr_un address;
  socklen_t len;

  int connection = accept(server, (struct sockaddr *)&address, &len);

  int32_t n = 0x11223344;
  write(client, &n, sizeof(int32_t));

  int32_t recv;
  read(connection, &recv, sizeof(int32_t));

  ASSERT_EQ(recv, n)
      << "Did not receive same number that was streamed over socket";

  unlink(p);
}
