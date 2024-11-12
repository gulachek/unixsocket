#ifndef UNIXSOCKET_H
#define UNIXSOCKET_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Create a Unix Domain Socket stream using the `socket` system call.
 * @return The return value of `socket`
 */
int unix_socket();

/**
 * Create a Unix Domain Socket stream pair using `socketpair`.
 * @param[out] socket_vector The `socket_vector` parameter passed to
 `socketpair`
 */
int unix_socketpair(int socket_vector[2]);

/**
 * Call `bind` on a socket with an `AF_UNIX` path address.
 * @param sock The socket's file descriptor
 * @param path The path to `bind` the socket to
 * @return The return value of the `bind` system call
 */
int unix_bind(int sock, const char *path);

/**
 * Call `connect` on a socket to an `AF_UNIX` path address.
 * @param sock The socket's file descriptor
 * @param path The path to `connect` to
 * @return The return value of the `connect` system call
 */
int unix_connect(int sock, const char *path);

/**
 * Send a file descriptor over a socket.
 * @param sock The socket to send the file descriptor over
 * @param fd_to_send The file descriptor to send
 * @return A positive value on success, -1 on failure with errno set
 * @remarks Use this with @ref unix_recv_fd
 */
int unix_send_fd(int sock, int fd_to_send);

/**
 * Receive a file descriptor over a socket.
 * @param sock The socket to receive a file descriptor over
 * @return The file descriptor on success, -1 on failure
 * @remarks Use this with @ref unix_send_fd
 */
int unix_recv_fd(int sock);

#ifdef __cplusplus
}
#endif

#endif
