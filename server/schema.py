from datetime import datetime
import uuid

class UserSchema:
    def __init__(self, name, password):
        self.user_id = str(uuid.uuid4())  # Unique user ID
        self.name = name
        self.password = password
        self.created_at = datetime.utcnow()
        self.predictions = []

    def add_prediction(self, input_image_base64, predicted_class, image_url):
        prediction = {
            "input_image": input_image_base64,
            "result": predicted_class,
            "image_url": image_url,  # Store the image URL
            "predicted_at": datetime.utcnow()
        }
        self.predictions.append(prediction)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "name": self.name,
            "password": self.password,
            "created_at": self.created_at,
            "predictions": self.predictions
        }
