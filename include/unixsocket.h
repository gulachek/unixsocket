#ifndef UNIXSOCKET_H
#define UNIXSOCKET_H

int unix_socket(int type);
int unix_socketpair(int type, int socket_vector[2]);
int unix_bind(int sock, const char *path);
int unix_connect(int sock, const char *path);
int unix_send_fd(int sock, int fd_to_send);
int unix_recv_fd(int sock);

#endif
