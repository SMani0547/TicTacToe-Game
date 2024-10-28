import subprocess
import time

# Define the commands to start both servers
python_command = ['python', 'server.py']
node_command = ['node', 'node.js']

# Start the Python server
print("Starting PVP server...")
python_process = subprocess.Popen(python_command)

# Wait for a moment to ensure the Python server has started
time.sleep(2)

# Start the Node.js WebSocket server
print("Starting PVE server...")
node_process = subprocess.Popen(node_command)

try:
    python_process.wait()
    node_process.wait()
except KeyboardInterrupt:
    print("Servers stopped.")