# server.py
import time, threading
import serial
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import firebase_admin
from firebase_admin import credentials, firestore

# ---------- CONFIG ----------
SERIAL_PORT = '/dev/cu.usbserial-110'
BAUD_RATE = 115200
SERVICE_ACCOUNT = 'serviceAccountKey.json'
FIREBASE_DB_URL = 'https://biotune-97203-default-rtdb.firebaseio.com/'
SESSIONS_NODE = '/sessions'
# ----------------------------

# Flask + SocketIO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # restrict origin in prod
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Firebase Admin init
cred = credentials.Certificate(SERVICE_ACCOUNT)

firebase_admin.initialize_app(cred)
db = firestore.client()


# Serial init
try:
    arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)
    print(f"Opened serial port: {SERIAL_PORT}")
except Exception as e:
    print("Error opening serial port:", e)
    arduino = None

session_active = False
current_session_ref = None

def serial_reader_loop():
    print("Serial reader loop ---")
    global session_active, current_session_ref
    if not arduino:
        print("No serial device available, serial reader will not run.")
        return
    while True:
        try:
            if session_active and arduino.in_waiting:
                line = arduino.readline().decode('utf-8', errors='ignore').strip()
                print(f"Raw {line}")
                
                if not line:
                    print("Nothing read, continuing ---")
                    continue

                parts = line.split(",")
                print(f"Read: {parts[1].split(".")[0]}")
                upload_to_firestore(parts[1].split(".")[0])
                
                
            else:
                time.sleep(0.01)
        except Exception as e:
            print("Serial read error:", e)
            time.sleep(0.5)

def upload_to_firestore(value):
    try:
        print("Attempting upload to firestore")
        test_ref = db.collection("BPMReadings").document("readings")
        test_ref.set({"BPM": value})
        print("Uploaded to firestore")
    except Exception as e:
        print(f"Failed to upload BPM\n ==========")

# Start thread
# threading.Thread(target=serial_reader_loop, daemon=True).start()

@app.route('/start', methods=['POST'])
def start_session():
    print("Starting ---")
    global session_active
    if session_active:
        return jsonify({'status': 'already_running'}), 400

    session_active = True

    if arduino:
        try:
            arduino.write(b'START\n')
            print("Start command written")
            time.sleep(4)
            print("Sleep over")
            serial_thread = threading.Thread(target=serial_reader_loop, daemon=True)
            serial_thread.start()
        except Exception as e:
            print(f"Failed to start arduino {e}")
            return jsonify({'status': 'error_writing_serial', 'error': str(e)}), 500
            

    return jsonify({'status': 'started'})


# @app.route('/start', methods=['POST'])
# def start_session():
#     print("Starting ---")
#     global session_active, current_session_ref
#     if session_active:
#         return jsonify({'status': 'already_running'}), 400
#     # Create session node
#     session_active = True

#     # Send START to MCU
#     if arduino:
#         try:
#             arduino.write(b'START\n')
#         except Exception as e:
#             return jsonify({'status': 'error_writing_serial', 'error': str(e)}), 500
        
#         serial_thread = threading.Thread(target=serial_reader_loop, daemon=True)
#         serial_thread.start()

#     return jsonify({'status': 'started'})

@app.route('/stop', methods=['POST'])
def stop_session():
    global session_active
    if not session_active:
        return jsonify({'status': 'not_running'}), 400
    session_active = False
    if arduino:
        try:
            arduino.write(b'STOP')
        except Exception as e:
            print("Error writing STOP:", e)
    return jsonify({'status': 'stopped'})

@socketio.on('connect')
def on_connect():
    print("Client connected")

@socketio.on('disconnect')
def on_disconnect():
    print("Client disconnected")

if __name__ == '__main__':
    # run: python server.py
    socketio.run(app, host='0.0.0.0', port=5000)
