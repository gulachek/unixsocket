cmake_minimum_required(VERSION 3.10)
project(UnixSocketTest)

find_package(unixsocket REQUIRED)

add_executable(test
	test.c
)

target_link_libraries(test PRIVATE unixsocket)
