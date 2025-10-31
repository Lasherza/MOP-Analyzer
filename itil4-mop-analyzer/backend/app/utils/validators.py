from typing import Optional
import re


class InputValidator:
    """Validate user inputs for security."""
    
    @staticmethod
    def validate_analysis_id(analysis_id: str) -> bool:
        """Validate analysis ID format (UUID)."""
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        return bool(uuid_pattern.match(analysis_id))
    
    @staticmethod
    def sanitize_category(category: str) -> str:
        """Sanitize category input."""
        # Remove any HTML/script tags
        category = re.sub(r'<[^>]*>', '', category)
        # Limit length
        return category[:200]
    
    @staticmethod
    def validate_filename(filename: str) -> bool:
        """Validate filename for security."""
        # Check for directory traversal attempts
        if '..' in filename or '/' in filename or '\\' in filename:
            return False
        
        # Check length
        if len(filename) > 255:
            return False
        
        # Check for null bytes
        if '\x00' in filename:
            return False
        
        return True
    
    @staticmethod
    def sanitize_text(text: str, max_length: int = 10000) -> str:
        """Sanitize text input."""
        # Remove null bytes
        text = text.replace('\x00', '')
        # Limit length
        return text[:max_length]


validator = InputValidator()
