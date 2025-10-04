from flask import Flask, request, jsonify
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression

# Load your model (or you can include training here if needed)
model = joblib.load("logistic_model.pkl")  # Model saved from training
features = ['ALLSKY_SFC_SW_DWN', 'T2M', 'T2M_MAX', 'T2M_MIN', 'RH2M', 'WS2M']

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data
        data = request.get_json(force=True)
        
        # Convert to DataFrame
        input_df = pd.DataFrame([data], columns=features)
        
        # Predict
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]

        return jsonify({
            "prediction": int(prediction),
            "probability": round(probability, 4)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
