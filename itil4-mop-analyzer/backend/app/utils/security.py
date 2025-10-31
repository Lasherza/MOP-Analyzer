from cryptography.fernet import Fernet
from passlib.context import CryptContext
import secrets
import hashlib
from pathlib import Path

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SecurityManager:
    """Handle security operations including encryption and file validation."""
    
    def __init__(self, secret_key: str = None):
        if secret_key:
            # Derive a valid Fernet key from the secret
            key = hashlib.sha256(secret_key.encode()).digest()
            self.fernet = Fernet(Fernet.generate_key())  # Using generated key for now
        else:
            self.fernet = Fernet(Fernet.generate_key())
    
    def encrypt_file_path(self, file_path: str) -> str:
        """Encrypt file path for storage."""
        encrypted = self.fernet.encrypt(file_path.encode())
        return encrypted.decode()
    
    def decrypt_file_path(self, encrypted_path: str) -> str:
        """Decrypt stored file path."""
        decrypted = self.fernet.decrypt(encrypted_path.encode())
        return decrypted.decode()
    
    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generate a secure random token."""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password for storage."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def validate_file_type(filename: str, allowed_extensions: list) -> bool:
        """Validate file type by extension."""
        file_ext = Path(filename).suffix.lower()
        return file_ext in allowed_extensions
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent directory traversal."""
        # Remove any directory components
        filename = Path(filename).name
        # Remove any potentially dangerous characters
        safe_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._- ")
        sanitized = ''.join(c if c in safe_chars else '_' for c in filename)
        return sanitized
    
    @staticmethod
    def check_file_size(file_size: int, max_size: int) -> bool:
        """Check if file size is within allowed limit."""
        return file_size <= max_size


# Singleton instance
security_manager = SecurityManager()
