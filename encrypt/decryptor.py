from encrypt.key import derive_key
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import json
import base64

def decrypt_data(encrypted_data, password):
    data = base64.b64decode(encrypted_data)
    salt = data[:16]
    iv = data[16:32]
    encrypted = data[32:]
    key = derive_key(password, salt)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted_data = decryptor.update(encrypted) + decryptor.finalize()
    return json.loads(decrypted_data.rstrip().decode())