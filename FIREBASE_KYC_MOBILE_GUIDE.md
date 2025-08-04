# Firebase KYC Integration Guide for Mobile Developer

## Overview
This guide provides step-by-step instructions for implementing Firebase KYC (Know Your Customer) verification in the TechiProConnect mobile app. The system uses Firebase ML Kit for document verification and integrates with our backend API for processing and admin review.

## Architecture Flow
1. **Mobile App** → Captures documents using Firebase ML Kit
2. **Firebase ML Kit** → Processes documents and extracts data
3. **Firebase Storage** → Stores document images
4. **Mobile App** → Submits results to TechiProConnect API
5. **Backend API** → Processes submission (auto-approve or admin review)
6. **Admin Dashboard** → Reviews low-confidence submissions

## Prerequisites

### Firebase Setup
1. **Firebase Project**: Ensure your Firebase project has these services enabled:
   - ML Kit (Document Scanner API)
   - Cloud Storage
   - Authentication (if not already set up)

2. **Dependencies** (Add to your mobile app):
   ```json
   // For Flutter
   "firebase_ml_vision": "^0.12.0+3",
   "firebase_storage": "^11.0.0",
   "http": "^0.13.5"
   
   // For React Native
   "@react-native-firebase/ml": "^15.0.0",
   "@react-native-firebase/storage": "^15.0.0",
   "axios": "^1.0.0"
   
   // For Android Native
   implementation 'com.google.firebase:firebase-ml-vision:24.1.0'
   implementation 'com.google.firebase:firebase-storage:20.0.1'
   
   // For iOS Native
   pod 'Firebase/MLVision'
   pod 'Firebase/Storage'
   ```

## Implementation Steps

### Step 1: Set Up Document Scanning

#### Flutter Example:
```dart
import 'package:firebase_ml_vision/firebase_ml_vision.dart';
import 'package:image_picker/image_picker.dart';

class KYCDocumentScanner {
  final FirebaseVision _vision = FirebaseVision.instance;
  final ImagePicker _picker = ImagePicker();
  
  Future<Map<String, dynamic>> scanDocument() async {
    // Capture image
    final XFile? image = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );
    
    if (image == null) return {};
    
    // Process with ML Kit
    final FirebaseVisionImage visionImage = 
        FirebaseVisionImage.fromFile(File(image.path));
    
    final TextRecognizer textRecognizer = 
        _vision.textRecognizer();
    
    final VisionText visionText = 
        await textRecognizer.processImage(visionImage);
    
    // Extract document data
    Map<String, dynamic> extractedData = {
      'documentType': 'national_id', // or 'passport', 'drivers_license'
      'extractedText': visionText.text,
      'confidence': calculateConfidence(visionText),
      'timestamp': DateTime.now().toIso8601String(),
    };
    
    textRecognizer.close();
    return extractedData;
  }
  
  double calculateConfidence(VisionText visionText) {
    // Implement your confidence calculation logic
    // Based on text clarity, document format recognition, etc.
    double totalConfidence = 0.0;
    int blockCount = 0;
    
    for (TextBlock block in visionText.blocks) {
      for (TextLine line in block.lines) {
        // Add confidence scoring logic here
        totalConfidence += line.confidence ?? 0.0;
        blockCount++;
      }
    }
    
    return blockCount > 0 ? totalConfidence / blockCount : 0.0;
  }
}
```

#### React Native Example:
```javascript
import ml from '@react-native-firebase/ml';
import {launchCamera} from 'react-native-image-picker';

class KYCDocumentScanner {
  async scanDocument() {
    // Capture image
    const result = await new Promise((resolve) => {
      launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      }, resolve);
    });
    
    if (result.didCancel || !result.assets?.[0]) {
      return {};
    }
    
    const imageUri = result.assets[0].uri;
    
    // Process with ML Kit
    const textRecognition = await ml().cloudTextRecognizerProcessImage(imageUri);
    
    // Extract document data
    const extractedData = {
      documentType: 'national_id',
      extractedText: textRecognition.text,
      confidence: this.calculateConfidence(textRecognition),
      timestamp: new Date().toISOString(),
    };
    
    return extractedData;
  }
  
  calculateConfidence(textRecognition) {
    // Implement confidence calculation
    const blocks = textRecognition.blocks || [];
    if (blocks.length === 0) return 0.0;
    
    const totalConfidence = blocks.reduce((sum, block) => {
      return sum + (block.confidence || 0);
    }, 0);
    
    return totalConfidence / blocks.length;
  }
}
```

### Step 2: Upload Documents to Firebase Storage

#### Flutter Example:
```dart
import 'package:firebase_storage/firebase_storage.dart';

class FirebaseStorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;
  
  Future<List<String>> uploadDocuments(List<File> documents, String technicianId) async {
    List<String> downloadUrls = [];
    
    for (int i = 0; i < documents.length; i++) {
      try {
        // Create unique filename
        String fileName = 'kyc_documents/${technicianId}_${DateTime.now().millisecondsSinceEpoch}_$i.jpg';
        
        // Upload to Firebase Storage
        TaskSnapshot snapshot = await _storage
            .ref(fileName)
            .putFile(documents[i]);
        
        // Get download URL
        String downloadUrl = await snapshot.ref.getDownloadURL();
        downloadUrls.add(downloadUrl);
        
      } catch (e) {
        print('Error uploading document $i: $e');
      }
    }
    
    return downloadUrls;
  }
}
```

#### React Native Example:
```javascript
import storage from '@react-native-firebase/storage';

class FirebaseStorageService {
  async uploadDocuments(documentUris, technicianId) {
    const downloadUrls = [];
    
    for (let i = 0; i < documentUris.length; i++) {
      try {
        const fileName = `kyc_documents/${technicianId}_${Date.now()}_${i}.jpg`;
        const reference = storage().ref(fileName);
        
        await reference.putFile(documentUris[i]);
        const downloadUrl = await reference.getDownloadURL();
        
        downloadUrls.push(downloadUrl);
      } catch (error) {
        console.error(`Error uploading document ${i}:`, error);
      }
    }
    
    return downloadUrls;
  }
}
```

### Step 3: Submit to TechiProConnect API

#### API Endpoint Details:
- **URL**: `POST /api/v1/technicians/{technicianId}/firebase-kyc`
- **Authentication**: Bearer JWT token (technician role)
- **Content-Type**: `application/json`

#### Flutter Example:
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class KYCApiService {
  static const String baseUrl = 'https://techiproconnect.onrender.com/api/v1';
  
  Future<Map<String, dynamic>> submitKYCResults({
    required String technicianId,
    required String authToken,
    required String firebaseKycStatus,
    required Map<String, dynamic> firebaseKycData,
    required List<String> documentUrls,
    required double confidenceScore,
  }) async {
    
    final url = Uri.parse('$baseUrl/technicians/$technicianId/firebase-kyc');
    
    final requestBody = {
      'firebaseKycStatus': firebaseKycStatus,
      'firebaseKycData': firebaseKycData,
      'documentUrls': documentUrls,
      'confidenceScore': confidenceScore,
    };
    
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: json.encode(requestBody),
      );
      
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to submit KYC: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
```

#### React Native Example:
```javascript
import axios from 'axios';

class KYCApiService {
  static baseUrl = 'https://techiproconnect.onrender.com/api/v1';
  
  static async submitKYCResults({
    technicianId,
    authToken,
    firebaseKycStatus,
    firebaseKycData,
    documentUrls,
    confidenceScore,
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/technicians/${technicianId}/firebase-kyc`,
        {
          firebaseKycStatus,
          firebaseKycData,
          documentUrls,
          confidenceScore,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit KYC: ${error.response?.status || error.message}`);
    }
  }
}
```

### Step 4: Complete Implementation Example

#### Flutter Complete Flow:
```dart
class KYCVerificationService {
  final KYCDocumentScanner _scanner = KYCDocumentScanner();
  final FirebaseStorageService _storage = FirebaseStorageService();
  final KYCApiService _api = KYCApiService();
  
  Future<Map<String, dynamic>> performKYCVerification(String technicianId, String authToken) async {
    try {
      // Step 1: Scan front of document
      Map<String, dynamic> frontScanResult = await _scanner.scanDocument();
      
      // Step 2: Scan back of document (if needed)
      Map<String, dynamic> backScanResult = await _scanner.scanDocument();
      
      // Step 3: Capture selfie for face matching
      Map<String, dynamic> selfieResult = await _scanner.captureSelfie();
      
      // Step 4: Upload documents to Firebase Storage
      List<File> documents = [
        File(frontScanResult['imagePath']),
        File(backScanResult['imagePath']),
        File(selfieResult['imagePath']),
      ];
      
      List<String> documentUrls = await _storage.uploadDocuments(documents, technicianId);
      
      // Step 5: Calculate overall confidence
      double overallConfidence = (
        frontScanResult['confidence'] + 
        backScanResult['confidence'] + 
        selfieResult['faceMatchScore']
      ) / 3;
      
      // Step 6: Determine status based on confidence
      String status = overallConfidence >= 0.8 
          ? 'FIREBASE_VERIFIED' 
          : 'ADMIN_REVIEW_REQUIRED';
      
      // Step 7: Prepare Firebase KYC data
      Map<String, dynamic> firebaseKycData = {
        'frontDocument': frontScanResult,
        'backDocument': backScanResult,
        'selfie': selfieResult,
        'processingTimestamp': DateTime.now().toIso8601String(),
        'deviceInfo': await getDeviceInfo(),
      };
      
      // Step 8: Submit to API
      Map<String, dynamic> apiResponse = await _api.submitKYCResults(
        technicianId: technicianId,
        authToken: authToken,
        firebaseKycStatus: status,
        firebaseKycData: firebaseKycData,
        documentUrls: documentUrls,
        confidenceScore: overallConfidence,
      );
      
      return apiResponse;
      
    } catch (e) {
      throw Exception('KYC verification failed: $e');
    }
  }
  
  Future<Map<String, dynamic>> getDeviceInfo() async {
    // Add device information for audit purposes
    return {
      'platform': Platform.isIOS ? 'iOS' : 'Android',
      'version': '1.0.0', // Your app version
      'timestamp': DateTime.now().toIso8601String(),
    };
  }
}
```

## Status Values Reference

### Firebase KYC Status Options:
- `PENDING`: Initial status before processing
- `PROCESSING`: Currently being processed by Firebase ML
- `FIREBASE_VERIFIED`: High confidence, auto-approved
- `FIREBASE_REJECTED`: Low confidence, rejected
- `FIREBASE_ERROR`: Error during Firebase processing
- `ADMIN_REVIEW_REQUIRED`: Medium confidence, needs admin review

### Confidence Score Guidelines:
- **0.8 - 1.0**: High confidence → Auto-approve
- **0.5 - 0.79**: Medium confidence → Admin review required
- **0.0 - 0.49**: Low confidence → Auto-reject

## Error Handling

### Common Error Scenarios:
```dart
class KYCErrorHandler {
  static void handleKYCError(Exception error) {
    if (error.toString().contains('404')) {
      // Technician not found
      showError('Technician account not found. Please contact support.');
    } else if (error.toString().contains('401')) {
      // Authentication failed
      showError('Authentication failed. Please login again.');
    } else if (error.toString().contains('Network error')) {
      // Network issues
      showError('Network connection failed. Please check your internet.');
    } else {
      // Generic error
      showError('KYC verification failed. Please try again.');
    }
  }
}
```

## Testing Checklist

### Before Production:
- [ ] Test with various document types (ID, passport, driver's license)
- [ ] Test with different lighting conditions
- [ ] Test with blurry/low-quality images
- [ ] Test network error scenarios
- [ ] Test authentication failure scenarios
- [ ] Verify document upload to Firebase Storage
- [ ] Test confidence score calculation accuracy
- [ ] Verify API integration with backend

### Test Data for Development:
```json
{
  "firebaseKycStatus": "FIREBASE_VERIFIED",
  "firebaseKycData": {
    "documentType": "national_id",
    "extractedText": "JOHN DOE\n123456789\nBorn: 1990-01-01",
    "confidence": 0.85,
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "documentUrls": [
    "https://firebasestorage.googleapis.com/test-front.jpg",
    "https://firebasestorage.googleapis.com/test-back.jpg"
  ],
  "confidenceScore": 0.85
}
```

## API Documentation

Full API documentation is available at:
- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://techiproconnect.onrender.com/api-docs`

Look for the **"Firebase KYC"** section in the Swagger documentation for complete endpoint details.

## Support

For technical support or questions:
- **Backend API**: Check the Swagger documentation
- **Firebase Issues**: Refer to Firebase ML Kit documentation
- **Integration Issues**: Contact the backend development team

## Security Notes

1. **Never store sensitive document data locally**
2. **Always use HTTPS for API calls**
3. **Implement proper JWT token management**
4. **Validate file types before upload**
5. **Use Firebase Security Rules for storage access**
6. **Implement proper error logging (without sensitive data)**

This guide provides a complete implementation framework for Firebase KYC integration. Adapt the code examples to your specific mobile platform and requirements.
