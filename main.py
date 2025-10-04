# Save your model and scaler first (Assuming you saved them from your training script)
# import joblib
# joblib.dump(log_reg_model, 'log_reg_model.pkl')
# joblib.dump(scaler, 'scaler.pkl')

from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# --- Load Model and Scaler ---
try:
    # Load the trained model and scaler (adjust names as needed)
    MODEL = joblib.load('log_reg_model.pkl')
    SCALER = joblib.load('scaler.pkl')
    # List of features used for training
    FEATURE_COLS = ['ALLSKY_SFC_SW_DWN', 'T2M', 'T2M_MAX', 'T2M_MIN', 'RH2M', 'WS2M'] 
    
    print("Model and Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model or scaler: {e}")
    MODEL = None
    SCALER = None

# --- Prediction Endpoint ---
@app.route('/predict_rain', methods=['POST'])
def predict():
    if MODEL is None or SCALER is None:
        return jsonify({'error': 'Model or scaler failed to load'}), 500
        
    try:
        # Get JSON data from the request body
        data = request.get_json(force=True)
        
        # 1. Convert JSON list to DataFrame/NumPy array
        # Input must be a dictionary where keys match FEATURE_COLS
        input_df = pd.DataFrame([data])
        
        # 2. Re-order and select the columns (crucial!)
        input_data = input_df[FEATURE_COLS]
        
        # 3. Scale the input data
        input_scaled = SCALER.transform(input_data)
        
        # 4. Make prediction (returns probability for class 1 - Rain)
        # We need predict_proba for the probability, and select the second column ([1])
        prediction_probability = MODEL.predict_proba(input_scaled)[:, 1][0]
        
        # 5. Determine binary class
        prediction_class = 1 if prediction_probability > 0.5 else 0

        # Return prediction as JSON
        return jsonify({
            'rain_probability': float(f"{prediction_probability:.4f}"),
            'rain_prediction': prediction_class,
            'message': 'Prediction successful'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'message': 'Prediction failed due to bad input data format.'}), 400

if __name__ == '__main__':
    # Run on a different port than the Node.js app
    app.run(port=5000, debug=True)