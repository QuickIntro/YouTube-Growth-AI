from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np
from PIL import Image
import io
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="YouTube Thumbnail Analyzer",
    description="AI-powered thumbnail analysis microservice",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ThumbnailAnalysisResponse(BaseModel):
    overall_score: float
    brightness_score: float
    contrast_score: float
    face_detection_score: float
    text_detection_score: float
    color_vibrancy_score: float
    recommendations: list[str]
    details: Dict[str, Any]

class ThumbnailAnalyzer:
    def __init__(self):
        # Load face detection cascade
        try:
            self.face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
        except Exception as e:
            logger.error(f"Error loading face cascade: {e}")
            self.face_cascade = None

    def analyze_thumbnail(self, image_bytes: bytes) -> Dict[str, Any]:
        """Comprehensive thumbnail analysis"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Invalid image data")

            # Run all analyses
            brightness = self._analyze_brightness(img)
            contrast = self._analyze_contrast(img)
            faces = self._detect_faces(img)
            text_regions = self._detect_text_regions(img)
            color_vibrancy = self._analyze_color_vibrancy(img)

            # Calculate overall score
            overall_score = self._calculate_overall_score(
                brightness, contrast, faces, text_regions, color_vibrancy
            )

            # Generate recommendations
            recommendations = self._generate_recommendations(
                brightness, contrast, faces, text_regions, color_vibrancy
            )

            return {
                "overall_score": round(overall_score, 2),
                "brightness_score": round(brightness['score'], 2),
                "contrast_score": round(contrast['score'], 2),
                "face_detection_score": round(faces['score'], 2),
                "text_detection_score": round(text_regions['score'], 2),
                "color_vibrancy_score": round(color_vibrancy['score'], 2),
                "recommendations": recommendations,
                "details": {
                    "brightness": brightness,
                    "contrast": contrast,
                    "faces": faces,
                    "text_regions": text_regions,
                    "color_vibrancy": color_vibrancy,
                    "dimensions": {
                        "width": img.shape[1],
                        "height": img.shape[0]
                    }
                }
            }

        except Exception as e:
            logger.error(f"Error analyzing thumbnail: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    def _analyze_brightness(self, img: np.ndarray) -> Dict[str, Any]:
        """Analyze image brightness"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = np.mean(gray)
        
        # Optimal brightness is around 120-140
        if 100 <= mean_brightness <= 160:
            score = 100
        elif 80 <= mean_brightness < 100 or 160 < mean_brightness <= 180:
            score = 75
        else:
            score = 50

        return {
            "score": score,
            "mean_value": float(mean_brightness),
            "status": "optimal" if score == 100 else "needs_adjustment"
        }

    def _analyze_contrast(self, img: np.ndarray) -> Dict[str, Any]:
        """Analyze image contrast"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        contrast = gray.std()
        
        # Higher contrast is generally better for thumbnails
        if contrast > 60:
            score = 100
        elif contrast > 40:
            score = 75
        elif contrast > 20:
            score = 50
        else:
            score = 25

        return {
            "score": score,
            "value": float(contrast),
            "status": "high" if score >= 75 else "low"
        }

    def _detect_faces(self, img: np.ndarray) -> Dict[str, Any]:
        """Detect faces in the image"""
        if self.face_cascade is None:
            return {"score": 50, "count": 0, "detected": False}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
        )

        face_count = len(faces)
        
        # Faces in thumbnails typically perform better
        if face_count == 1:
            score = 100
        elif face_count == 2:
            score = 90
        elif face_count > 2:
            score = 70
        else:
            score = 60  # No faces is okay but faces usually help

        return {
            "score": score,
            "count": int(face_count),
            "detected": face_count > 0,
            "positions": [{"x": int(x), "y": int(y), "w": int(w), "h": int(h)} 
                         for (x, y, w, h) in faces]
        }

    def _detect_text_regions(self, img: np.ndarray) -> Dict[str, Any]:
        """Detect potential text regions"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Use edge detection to find text-like regions
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter contours that might be text
        text_contours = [c for c in contours if cv2.contourArea(c) > 100]
        
        # Estimate text coverage
        total_area = img.shape[0] * img.shape[1]
        text_area = sum(cv2.contourArea(c) for c in text_contours)
        text_coverage = (text_area / total_area) * 100
        
        # Optimal text coverage is 10-30%
        if 10 <= text_coverage <= 30:
            score = 100
        elif 5 <= text_coverage < 10 or 30 < text_coverage <= 40:
            score = 75
        else:
            score = 50

        return {
            "score": score,
            "coverage_percent": round(text_coverage, 2),
            "regions_detected": len(text_contours)
        }

    def _analyze_color_vibrancy(self, img: np.ndarray) -> Dict[str, Any]:
        """Analyze color vibrancy and saturation"""
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        saturation = hsv[:, :, 1]
        mean_saturation = np.mean(saturation)
        
        # Higher saturation usually performs better
        if mean_saturation > 100:
            score = 100
        elif mean_saturation > 70:
            score = 80
        elif mean_saturation > 40:
            score = 60
        else:
            score = 40

        return {
            "score": score,
            "mean_saturation": float(mean_saturation),
            "status": "vibrant" if score >= 80 else "dull"
        }

    def _calculate_overall_score(self, brightness, contrast, faces, 
                                 text_regions, color_vibrancy) -> float:
        """Calculate weighted overall score"""
        weights = {
            "brightness": 0.15,
            "contrast": 0.20,
            "faces": 0.25,
            "text": 0.20,
            "color": 0.20
        }

        overall = (
            brightness['score'] * weights['brightness'] +
            contrast['score'] * weights['contrast'] +
            faces['score'] * weights['faces'] +
            text_regions['score'] * weights['text'] +
            color_vibrancy['score'] * weights['color']
        )

        return overall

    def _generate_recommendations(self, brightness, contrast, faces, 
                                  text_regions, color_vibrancy) -> list[str]:
        """Generate actionable recommendations"""
        recommendations = []

        if brightness['score'] < 75:
            if brightness['mean_value'] < 100:
                recommendations.append("Increase brightness - image is too dark")
            else:
                recommendations.append("Decrease brightness - image is too bright")

        if contrast['score'] < 75:
            recommendations.append("Increase contrast to make elements stand out more")

        if faces['count'] == 0:
            recommendations.append("Consider adding a face - thumbnails with faces typically perform better")
        elif faces['count'] > 2:
            recommendations.append("Too many faces detected - focus on 1-2 main subjects")

        if text_regions['coverage_percent'] < 10:
            recommendations.append("Add text overlay to communicate video topic clearly")
        elif text_regions['coverage_percent'] > 40:
            recommendations.append("Reduce text amount - thumbnail looks cluttered")

        if color_vibrancy['score'] < 70:
            recommendations.append("Increase color saturation to make thumbnail more eye-catching")

        if not recommendations:
            recommendations.append("Thumbnail looks great! All metrics are optimal")

        return recommendations

# Initialize analyzer
analyzer = ThumbnailAnalyzer()

@app.get("/")
async def root():
    return {
        "service": "YouTube Thumbnail Analyzer",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=ThumbnailAnalysisResponse)
async def analyze_thumbnail(file: UploadFile = File(...)):
    """
    Analyze a thumbnail image and return comprehensive metrics
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Analyze
        result = analyzer.analyze_thumbnail(image_bytes)
        
        return result

    except Exception as e:
        logger.error(f"Error processing thumbnail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
