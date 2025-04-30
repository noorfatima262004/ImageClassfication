from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from Crypto.Hash import SHA256
import base64
import bcrypt
import hashlib
import json
import uuid
from datetime import datetime

# Load MASTER_KEY from .env
import os
from dotenv import load_dotenv
load_dotenv()
MASTER_KEY = base64.b64decode(os.getenv("AES_MASTER_KEY"))

# AES-GCM Encryption
def aes_encrypt(data, key):
    if isinstance(data, str):
        data = data.encode('utf-8')
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return base64.b64encode(cipher.nonce + tag + ciphertext).decode('utf-8')

# AES-GCM Decryption
def aes_decrypt(encrypted_data, key):
    try:
        raw = base64.b64decode(encrypted_data)
        nonce = raw[:16]
        tag = raw[16:32]
        ciphertext = raw[32:]
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)
        return decrypted.decode('utf-8')
    except Exception as e:
        print("Decryption failed:", e)
        return None

# Username hash (for consistent lookup)
def hash_username(username):
    return hashlib.sha256(username.encode('utf-8')).hexdigest()

# User Schema
class UserSchema:
    def __init__(self, username, password):
        self.user_id = str(uuid.uuid4())
        self.username_hash = hash_username(username)
        self.encrypted_username = aes_encrypt(username, MASTER_KEY)
        self.password = self.hash_password(password)
        self.created_at = datetime.utcnow()
        self.predictions = []

    def hash_password(self, password):
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username_hash": self.username_hash,
            "name": self.encrypted_username,
            "password": self.password,
            "created_at": self.created_at,
            "predictions": self.predictions  # still encrypted
        }

