import requests
import numpy as np
import cv2

def download_image(url: str) -> np.ndarray:
    """
    Downloads an image from a URL, validates the response, and converts it to a NumPy array.
    Decodes the image and converts it from BGR to RGB.
    
    Args:
        url (str): The URL of the image to download.
        
    Returns:
        np.ndarray: The image in RGB format.
        
    Raises:
        Exception: If the download fails, response is not 200, or image decoding fails.
    """
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Failed to download image. Status code: {response.status_code}")
            
        image_data = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
        
        if image is None:
            raise Exception("Failed to decode image from response content")
            
        # Convert BGR to RGB (required by InsightFace)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        return image_rgb
        
    except requests.RequestException as e:
        raise Exception(f"Network error while downloading image: {str(e)}")
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")
