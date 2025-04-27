# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import base64
import io
from PIL import Image
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt
from werkzeug.utils import secure_filename
from schema import UserSchema  # Import UserSchema

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# Load environment variables
load_dotenv()
app.secret_key = os.getenv('FLASK_SECRET_KEY')  # Secret key
Base_url = os.getenv('BASE_URL')  # Base URL for image storage
# MongoDB Atlas Connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ImageClassification"]
collection = db["User"]

# Check MongoDB connection
try:
    client.server_info()
    print("MongoDB connected successfully!")
except Exception as e:
    print("MongoDB connection failed. Error:", e)

# Load model
model = tf.keras.models.load_model(os.getenv("MODEL_PATH"))

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
    img_array = img_array / 255.0  # Normalize image
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# Class names
class_names = [
    'american_football', 'baseball', 'basketball', 'billiard_ball',
    'bowling_ball', 'cricket_ball', 'football', 'golf_ball',
    'hockey_ball', 'hockey_puck', 'rugby_ball', 'shuttlecock',
    'table_tennis_ball', 'tennis_ball', 'volleyball', 'train'
]

# Configure upload and static folder
app.config['UPLOAD_FOLDER'] = 'static/images'
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png'}

# Function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


# Health check
@app.route('/', methods=['GET'])
def status():
    return jsonify({"message": "Server is up and running!"}), 200


# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    # Check if user already exists
    existing_user = collection.find_one({"name": username})
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    # Create new user using UserSchema
    user = UserSchema(name=username, password=password)
    user_dict = user.to_dict()

    # Insert into DB
    collection.insert_one(user_dict)

    return jsonify({
        "message": "User created successfully!",
        "user_id": user.user_id
    }), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    user = collection.find_one({"name": username})

    if user and user['password'] == password:
        token = jwt.encode(
            {
                'user_id': user['user_id'],
                'exp': datetime.utcnow() + timedelta(hours=1)
            },
            app.secret_key,
            algorithm='HS256'
        )
        return jsonify({"token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Predict route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        auth = request.headers.get('Authorization', None)
        if not auth:
            return jsonify({"error": "Missing Authorization header"}), 401

        token = auth.split()[1]
        payload = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        user_id = payload['user_id']

        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files['image']
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid image type"}), 400

        # Save the image to the static/images folder
        file_path = save_image(file)

        # Preprocess the image for prediction
        img_array = preprocess_image(file_path)

        # Predict
        preds = model.predict(img_array)
        predicted_class_idx = int(np.argmax(preds, axis=1)[0])
        predicted_class_name = class_names[predicted_class_idx]

        # Generate the URL for the uploaded image
        image_url = f"{Base_url}/static/images/{os.path.basename(file_path)}"

        # Prepare prediction using UserSchema's structure
        input_image_base64 = base64.b64encode(open(file_path, "rb").read()).decode()  # Convert saved image to base64

        # Create a prediction object
        prediction = {
            "input_image": input_image_base64,
            "result": predicted_class_name,
            "image_url": image_url,  # Store the image URL
            "predicted_at": datetime.utcnow()
        }

        # Update user's predictions array in MongoDB
        collection.update_one(
            {"user_id": user_id},
            {"$push": {"predictions": prediction}}
        )

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


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
