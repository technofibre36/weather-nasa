import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib

# Load and preprocess data
df = pd.read_csv("nasa predict.csv", skiprows=15)
df['RAIN_TODAY'] = (df['PRECTOTCORR'] > 0).astype(int)
features = ['ALLSKY_SFC_SW_DWN', 'T2M', 'T2M_MAX', 'T2M_MIN', 'RH2M', 'WS2M']
X = df[features]
y = df['RAIN_TODAY']

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, "logistic_model.pkl")
