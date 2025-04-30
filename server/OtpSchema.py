import bcrypt
from datetime import datetime, timedelta
import uuid

class OtpSchema:
    def __init__(self, user_id, email, plain_otp, expiry_minutes=1, attempts=0):
        self.otp_id = str(uuid.uuid4())  # Unique ID for each OTP
        self.user_id = user_id  # User ID (can be None at first)
        self.email = email  # User email
        self.hashed_otp = self.hash_otp(plain_otp)  # Store hashed OTP
        self.expiry = datetime.utcnow() + timedelta(minutes=expiry_minutes)  # OTP expiry time
        self.created_at = datetime.utcnow()  # When OTP was created
        self.attempts = attempts  # Track how many failed attempts the user has made

    def hash_otp(self, otp):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(otp.encode('utf-8'), salt).decode('utf-8')

    def to_dict(self):
        return {
            "otp_id": self.otp_id,
            "user_id": self.user_id,
            "email": self.email,
            "otp": self.hashed_otp,
            "expiry": self.expiry,
            "created_at": self.created_at,
            "attempts": self.attempts  # Add attempts to the dictionary
        }

