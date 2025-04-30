from cryptography.fernet import Fernet
import os
import tensorflow as tf

# Load the secret key from the key file
def load_encryption_key():
    with open("model_secret.key", "rb") as key_file:
        key = key_file.read()
    return key

# Decrypt the model file
def decrypt_model():
    key = load_encryption_key()
    cipher = Fernet(key)

    # Read the encrypted model file
    with open("models/encrypted_model.h5", "rb") as encrypted_file:
        encrypted_data = encrypted_file.read()

    # Decrypt the model data
    decrypted_data = cipher.decrypt(encrypted_data)

    # Save the decrypted model temporarily
    temp_model_path = "models/temp_model.h5"
    with open(temp_model_path, "wb") as temp_file:
        temp_file.write(decrypted_data)

    return temp_model_path

# Load the decrypted model
def load_model():
    decrypted_model_path = decrypt_model()
    model = tf.keras.models.load_model(decrypted_model_path)

    # Optional: Delete the temporary model file after loading
    os.remove(decrypted_model_path)

    return model
