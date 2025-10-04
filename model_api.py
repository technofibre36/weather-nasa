from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Load model
model = joblib.load("logistic_model.pkl")
features = ['ALLSKY_SFC_SW_DWN', 'T2M', 'T2M_MAX', 'T2M_MIN', 'RH2M', 'WS2M']

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data], columns=features)
        prediction = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]
        return jsonify({
            "prediction": int(prediction),
            "probability": round(probability, 4)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
