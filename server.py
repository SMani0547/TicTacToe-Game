import socket
import threading
import json
import random

HOST = 'localhost'
PORT = 10048

def handle_client(conn, addr):
    print(f"Connection established from {addr[0]}:{addr[1]}")

    while True:
        data = conn.recv(1024)
        if not data:
            break
        message = data.decode()
        print(f"Received message from client: {message}")

        if message.startswith('move:'):
            move_info = message.split(':')[1].split(',')
            move_index = int(move_info[0])
            player = move_info[1]
            print(f"{player} made a move at index {move_index}")
            # Process the move information here if needed

            # Generate computer move (O) randomly
            computer_move_index = random.choice([idx for idx in range(9) if idx != move_index])
            print(f"Computer (O) made a move at index {computer_move_index}")

            # Send computer's move information back to the client
            response = f"move:{computer_move_index},O"
            conn.sendall(response.encode())
        elif message == 'exit':
            break
        elif message == 'disconnect':
            break
        else:
            conn.sendall("Unknown command".encode())

    # Close the connection
    conn.close()
    print(f"Connection closed from {addr[0]}:{addr[1]}")


def start_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((HOST, PORT))
    server_socket.listen(5)  # Listen for up to 5 incoming connections

    print(f"Server started. Listening on {HOST}:{PORT}")

    try:
        while True:
            client_socket, addr = server_socket.accept()
            client_handler = threading.Thread(target=handle_client, args=(client_socket, addr))
            client_handler.start()
    except KeyboardInterrupt:
        print("Server stopped.")

if __name__ == "__main__":
    start_server()
