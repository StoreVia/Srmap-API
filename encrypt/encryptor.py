import os
from encrypt.key import derive_key
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import json
import base64

def encrypt_data(data, password):
    salt = os.urandom(16)
    key = derive_key(password, salt)
    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    json_data = json.dumps(data).encode()
    padding_length = 16 - (len(json_data) % 16)
    padded_data = json_data + (b' ' * padding_length)
    encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
    combined_data = salt + iv + encrypted_data
    return base64.b64encode(combined_data).decode()