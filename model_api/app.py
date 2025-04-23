from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import tensorflow as tf
import re
import os
import gdown

# 🔽 Download model and vectorizer if not present
def download_from_drive():
    model_url = "https://drive.google.com/uc?id=1xJTUfLUN-HQxmhvj5j66tyX5EVAxeRDV"
    vectorizer_url = "https://drive.google.com/uc?id=1BK62H6MvXV1L3tPDeLE8AR-gMyflkmDJ"

    if not os.path.exists("ShieldCommsML.h5"):
        gdown.download(model_url, "ShieldCommsML.h5", quiet=False)
    if not os.path.exists("tfidf_vectorizer.pkl"):
        gdown.download(vectorizer_url, "tfidf_vectorizer.pkl", quiet=False)

download_from_drive()

# 🔽 Load model and vectorizer
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

# ✅ Inference route with short message filter
@app.post("/predict")
async def predict_email(input_data: EmailInput):
    email_text = input_data.text.strip()

    # 🚨 If message is too short, mark as Suspicious
    if len(email_text.split()) < 5:
        return {
            "prediction": "🤔 Suspicious",
            "phishing_probability": 50.0,
            "non_phishing_probability": 50.0,
            "phishing_score": phishing_score(email_text)
        }

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

# ✅ Run with Uvicorn (for Cloud Run or Render)
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
