from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import tensorflow as tf
import re

# Load model and vectorizer
model = tf.keras.models.load_model("ShieldCommsML.h5")
tfidf_vectorizer = joblib.load("tfidf_vectorizer.pkl")
EXPECTED_INPUT_DIM = model.input_shape[1]

app = FastAPI()

# 🟥 Phishing-indicative keywords
phishing_keywords = [
    'verify', 'account', 'suspended', 'click here', 'secure',
    'update', 'confirm', 'login', 'password', 'security',
    'bank', 'urgent', 'validate', 'credentials', 'limited time',
    'alert', 'locked', 'deactivated', 'unauthorized', 'warning'
]

# 🟩 Legitimate-indicative keywords
legitimate_keywords = [
    'invoice', 'receipt', 'order', 'delivery', 'payment',
    'subscription', 'membership', 'official', 'support',
    'contact us', 'authorized', 'refund', 'customer service',
    'tracking', 'calendar', 'meeting', 'github',
    'university', 'course', 'statement'
]

# 📈 Feature scoring function
def phishing_score(text):
    text = text.lower()
    score = sum(1 for word in phishing_keywords if word in text)
    score += len(re.findall(r'https?://[\w./-]+', text))  # links
    score += 2 * len(re.findall(r'\.(ru|cn|xyz|click|tk|ml)', text))  # risky TLDs
    score += text.count("!")  # urgency
    score -= sum(1 for word in legitimate_keywords if word in text)  # subtract legit cues
    return max(score, 0)  # no negative scores

# ✅ Request schema
class EmailInput(BaseModel):
    text: str

# ✅ Inference route
@app.post("/predict")
async def predict_email(input_data: EmailInput):
    email_text = input_data.text

    # TF-IDF vector
    input_vector = tfidf_vectorizer.transform([email_text]).toarray()

    # Compute phishing score
    phishing_score_val = np.array([[phishing_score(email_text)]])

    # Pad/truncate TF-IDF vector
    if input_vector.shape[1] < EXPECTED_INPUT_DIM - 1:
        pad = np.zeros((1, EXPECTED_INPUT_DIM - 1 - input_vector.shape[1]))
        input_vector = np.hstack((input_vector, pad))
    elif input_vector.shape[1] > EXPECTED_INPUT_DIM - 1:
        input_vector = input_vector[:, :EXPECTED_INPUT_DIM - 1]

    # Combine input
    final_input = np.hstack((input_vector, phishing_score_val))

    # Predict
    prediction = model.predict(final_input)
    phishing_prob = float(prediction[0][0])
    non_phishing_prob = 1.0 - phishing_prob

    # 3-class decision
    if phishing_prob >= 0.7:
        result = "⚠️ Phishing"
    elif phishing_prob >= 0.4:
        result = "🤔 Suspicious"
    else:
        result = "✅ Legitimate"

    return {
        "prediction": result,
        "phishing_probability": round(phishing_prob * 100, 2),
        "non_phishing_probability": round(non_phishing_prob * 100, 2),
        "phishing_score": int(phishing_score_val[0][0])
    }
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))  # ⬅️ Cloud Run injects PORT env var
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
