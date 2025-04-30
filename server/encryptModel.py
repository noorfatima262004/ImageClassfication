from cryptography.fernet import Fernet
import os

# Step 1: Generate and save a secure key (only once)
key = Fernet.generate_key()
with open("model_secret.key", "wb") as key_file:
    key_file.write(key)
print("🔐 Key generated and saved to model_secret.key")

# Step 2: Load model file
with open("models/resnet50_sports_ball_model.h5", "rb") as f:
    model_data = f.read()

# Step 3: Encrypt the model
cipher = Fernet(key)
encrypted_data = cipher.encrypt(model_data)

# Step 4: Save encrypted model
with open("models/encrypted_model.h5", "wb") as f:
    f.write(encrypted_data)

print("✅ Model encrypted and saved as encrypted_model.h5")
