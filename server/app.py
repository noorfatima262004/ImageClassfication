# app.py
from schema import MASTER_KEY, aes_encrypt, aes_decrypt, hash_username
from flask import Flask, request, jsonify,make_response, redirect
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import base64
import io
import re
import smtplib
from decryption import load_model
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from PIL import Image
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
import bcrypt
from werkzeug.utils import secure_filename
from schema import UserSchema  # Import UserSchema
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import random
from OtpSchema import OtpSchema
import time
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import smtplib
from email.mime.text import MIMEText

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])
limiter = Limiter(get_remote_address, app=app)

MAX_FILE_SIZE = 1 * 1024 * 1024  


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "success": False,
        "message": "Rate limit exceeded. Please try again later."
    }), 429

# Load environment variables
load_dotenv()
app.secret_key = os.getenv('FLASK_SECRET_KEY')  # Secret key
serializer = URLSafeTimedSerializer(app.secret_key)
Base_url = os.getenv('BASE_URL')  # Base URL for image storage
# MongoDB Atlas Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ImageClassification"]
collection = db["User"]
otp_collection = db["otps"]


# Check MongoDB connection
try:
    client.server_info()
    print("MongoDB connected successfully!")
except Exception as e:
    print("MongoDB connection failed. Error:", e)

# Load model
# model = tf.keras.models.load_model(os.getenv("MODEL_PATH"))

# Function to save the uploaded file
def save_image(file):
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    return file_path
# Function to preprocess the image
def preprocess_image(file_path):
    img = Image.open(file_path).convert('RGB')  # Open the image and convert to RGB
    img = img.resize((256, 256))  # Resize the image
    img_array = np.array(img)  # Convert image to numpy array
    # Do NOT divide by 255 because model was trained without normalization
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array


# Class names
class_names = [
    'american_football', 'baseball', 'basketball', 'billiard_ball',
    'bowling_ball', 'cricket_ball', 'football', 'golf_ball',
    'hockey_ball', 'hockey_puck', 'rugby_ball', 'shuttlecock',
    'table_tennis_ball', 'tennis_ball','volleyball'
]
# Configure upload and static folder
app.config['UPLOAD_FOLDER'] = 'static/images'
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png'}

one_time_tokens = {}  # token -> {"email": ..., "used": False}


# Function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


def send_email_otp(receiver_email, otp):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    # Create a secure connection to SMTP server
    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = 'Your One-Time Password (OTP) for Secure Access'

        # Define the expiration time (in minutes)
        expiration_time = 1

        # HTML email body with professional design
        html_content = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f4f4f4;
                    padding: 20px;
                }}
                .email-container {{
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }}
                .otp-header {{
                    font-size: 20px;
                    font-weight: bold;
                    color: #4CAF50;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #FF5722;
                    margin: 20px 0;
                }}
                .footer {{
                    font-size: 12px;
                    color: #888888;
                    text-align: center;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <p>Dear User,</p>
                <p class="otp-header">Your One-Time Password (OTP)</p>
                <p class="otp">{otp}</p>
                <p>This OTP will expire in <strong>{expiration_time} minutes</strong>. Please use it immediately.</p>
                <p>If you did not request this OTP, please ignore this message.</p>
                <p class="footer">
                    For security reasons, we recommend not sharing your OTP with anyone.<br>
                    <strong>Do not share this OTP with anyone.</strong><br>
                    If you have any concerns, please contact our support team.
                </p>
            </div>
        </body>
        </html>
        """

        # Attach the HTML body to the email
        msg.attach(MIMEText(html_content, 'html'))

        # Send the email via SMTP with secure SSL connection
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)

        return True

    except Exception as e:
        print(f"Error sending OTP email: {e}")
        return False

@app.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('username')

    if not email or not is_valid_email(email):
        return jsonify({"error": "Valid email is required"}), 400

    # Generate OTP
    otp = str(random.randint(100000, 999999))

    # Create OTP object with attempts initialized to 0
    otp_obj = OtpSchema(email=email, plain_otp=otp, attempts=0, user_id=None)

    # Insert OTP into the database (update or insert)
    otp_collection.update_one(
        {"email": email},
        {"$set": otp_obj.to_dict()},
        upsert=True
    )

    # Send OTP email
    if not send_email_otp(email, otp):
        return jsonify({"error": "Failed to send email"}), 500

    return jsonify({"message": "OTP sent to your email!"}), 200

def is_otp_valid(record, input_otp):
    stored_hashed_otp = record.get("otp")
    expiry_time = record.get("expiry")
    if datetime.utcnow() > expiry_time:
        return False
    return bcrypt.checkpw(input_otp.encode('utf-8'), stored_hashed_otp.encode('utf-8'))

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('username')  # Get email from the request
    otp_input = data.get('otp')  # Get OTP entered by the user

    # Find the OTP record for the given email
    record = otp_collection.find_one({"email": email})
    if not record:
        return jsonify({"error": "OTP not found"}), 404

    # Check if OTP has expired
    if datetime.utcnow() > record.get('expiry'):
        return jsonify({"error": "OTP has expired"}), 400

    # Check if the user has exceeded the maximum number of attempts (3)
    if record.get('attempts') >= 3:
        return jsonify({"error": "You have exceeded the maximum OTP attempts. Please try again later."}), 400

    # Validate OTP (compare the entered OTP with the hashed OTP stored in the DB)
    if not is_otp_valid(record, otp_input):
        # Increment the attempts counter in the database
        otp_collection.update_one(
            {"email": email},
            {"$inc": {"attempts": 1}}  # Increment the attempts counter by 1
        )
        return jsonify({"error": "Invalid OTP"}), 400

    # If OTP is valid, reset the attempts counter and mark the OTP as verified
    otp_collection.update_one(
        {"email": email},
        {"$set": {"verified": True, "attempts": 0}}  # Reset attempts after successful OTP verification
    )

    return jsonify({"message": "OTP verified successfully!"}), 200


# Health check
@app.route('/', methods=['GET'])
def status():
    return jsonify({"message": "Server is up and running!f"}), 200

@app.route('/signup', methods=['POST'])
@limiter.limit("20 per day")
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    # OTP check
    otp_record = otp_collection.find_one({"email": username})
    if not otp_record or not otp_record.get("verified"):
        return jsonify({"error": "OTP not verified. Please verify your email first."}), 403

    # Check user by hashed username
    hashed_username = hash_username(username)
    existing_user = collection.find_one({"username_hash": hashed_username})
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    print(f"\nCreating user with username: {username}, password: {password}")
    user = UserSchema(username, password)
    collection.insert_one(user.to_dict())
    print(f"\nUser created: {user.to_dict()}")

    return jsonify({
        "message": "User created successfully!",
        "user_id": user.user_id
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    print(f"\nLogin attempt with username: {username}")

    # Find user by hashed username
    hashed_username = hash_username(username)
    user_data = collection.find_one({"username_hash": hashed_username})

    if not user_data:
        return jsonify({"message": "User not found"}), 404

    # Decrypt the stored encrypted name to verify it matches
    decrypted_name = aes_decrypt(user_data['name'], MASTER_KEY)
    print(f"\nDecrypted name: {decrypted_name}")
    
    if decrypted_name != username:
        return jsonify({"message": "Invalid username"}), 401

    # Check for account lockout - new code
    current_time = datetime.utcnow()
    
    # Initialize failed_attempts if it doesn't exist
    if 'failed_attempts' not in user_data:
        collection.update_one(
            {"username_hash": hashed_username},
            {"$set": {"failed_attempts": 0, "last_failed_attempt": None, "account_locked_until": None}}
        )
        user_data['failed_attempts'] = 0
    
    # Check if account is locked
    if user_data.get('account_locked_until'):
        lock_time = user_data['account_locked_until']
        if isinstance(lock_time, str):
            lock_time = datetime.fromisoformat(lock_time)
        
        if current_time < lock_time:
            remaining_time = (lock_time - current_time).total_seconds() / 60
            return jsonify({
                "message": f"Account is temporarily locked. Please try again in {int(remaining_time)} minutes.",
                "locked": True,
                "lockout_remaining": int(remaining_time)
            }), 403

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8')):
        # Update failed attempts count
        new_attempt_count = user_data.get('failed_attempts', 0) + 1
        update_data = {
            "failed_attempts": new_attempt_count,
            "last_failed_attempt": current_time
        }
        
        # Lock account if failed attempts >= 3
        if new_attempt_count >= 3:
            # Lock for 15 minutes
            lockout_time = current_time + timedelta(minutes=15)
            update_data["account_locked_until"] = lockout_time
            
            collection.update_one(
                {"username_hash": hashed_username},
                {"$set": update_data}
            )
            
            return jsonify({
                "message": "Account locked due to too many failed attempts. Please try again after 15 minutes.",
                "locked": True,
                "lockout_remaining": 15
            }), 403
        else:
            collection.update_one(
                {"username_hash": hashed_username},
                {"$set": update_data}
            )
            
            remaining_attempts = 3 - new_attempt_count
            return jsonify({
                "message": f"Invalid password. {remaining_attempts} attempts remaining before account lockout.",
                "remaining_attempts": remaining_attempts
            }), 401

    # If login successful, reset failed attempts counter
    collection.update_one(
        {"username_hash": hashed_username},
        {"$set": {"failed_attempts": 0, "last_failed_attempt": None, "account_locked_until": None}}
    )

    # Generate JWT token
    token = jwt.encode({
        'user_id': user_data['user_id'],
        'exp': datetime.utcnow() + timedelta(minutes=15)
    }, app.secret_key, algorithm='HS256')

    response = jsonify({"message": "Login successful", "username": decrypted_name})
    response.set_cookie('token', token, httponly=True, secure=True, samesite='Strict', max_age=3600)
    return response, 200

@app.route('/predict', methods=['POST'])
@limiter.limit("5 per day")  # 3 predictions per day per user/IP
def predict():
    try:
        # Get the token from Cookies instead of headers
        token = request.cookies.get('token')

        if not token:
            return jsonify({"success": False, "message": "Missing authentication token"}), 401

        # Decode the token to get user_id
        payload = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        user_id = payload['user_id']

        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']

        # Check file size before processing
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)  # Reset file pointer
        if file_length > MAX_FILE_SIZE:
            return jsonify({"success": False, "message": "File size is too large. Maximum allowed size is 2MB"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid image type"}), 400

        # Save the image
        file_path = save_image(file)

        # Preprocess the image
        img_array = preprocess_image(file_path)

        # Load the decrypted model (example)
        model = load_model()

        # Predict
        preds = model.predict(img_array)
        predicted_class_idx = int(np.argmax(preds, axis=1)[0])
        predicted_class_name = class_names[predicted_class_idx]

        # Generate URL for image
        image_url = f"{Base_url}/static/images/{os.path.basename(file_path)}"

        # Convert input image to base64
        input_image_base64 = base64.b64encode(open(file_path, "rb").read()).decode()

        # Create prediction object
        # Encrypt all fields
        encrypted_prediction = {
        "input_image": aes_encrypt(input_image_base64, MASTER_KEY),
        "result": aes_encrypt(predicted_class_name, MASTER_KEY),
        "image_url": aes_encrypt(image_url, MASTER_KEY),
        "predicted_at": aes_encrypt(datetime.utcnow().isoformat(), MASTER_KEY)
        }


        # Update user's predictions in MongoDB
        result = collection.update_one(
            {"user_id": user_id},
            {"$push": {"predictions": encrypted_prediction}}
        )

        if result.modified_count == 0:
            print(f"Warning: No user found with id {user_id} to update prediction.")

        return jsonify({
            "predicted_class_name": predicted_class_name,
            "user_id": user_id,
            "image_url": image_url
        })

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie(
    'token',
    path='/',
    secure=True,
    samesite='Strict')

    return response

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)




