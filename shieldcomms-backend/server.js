const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const tf = require('@tensorflow/tfjs-node'); // TensorFlow for prediction
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Middleware to authenticate the user
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).send('Access denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, username });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).send('Error registering user');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(400).send('Error logging in');
    }
});

// Account endpoint to get user details
app.get('/account', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(400).send('Error fetching user data');
    }
});

// Account update endpoint
app.put('/account', authenticate, async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).send('Invalid current password');
        }
        const updateData = {};
        if (email) updateData.email = email;
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }
        await User.findByIdAndUpdate(req.user.id, updateData);
        res.send('Account updated successfully');
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).send('Internal server error');
    }
});

// Load the model and tokenizer
let model;
let tokenizer;

const loadModelAndTokenizer = async () => {
    try {
        model = await tf.loadLayersModel(`file://${path.join(__dirname, 'model.keras')}`);
        console.log('Model loaded successfully.');

        const tokenizerPath = path.join(__dirname, 'tokenizer.json');
        const tokenizerData = fs.readFileSync(tokenizerPath, 'utf-8');
        tokenizer = JSON.parse(tokenizerData);
        console.log('Tokenizer loaded successfully.');
    } catch (error) {
        console.error('Error loading model or tokenizer:', error);
    }
};

// Call the function to load model and tokenizer
loadModelAndTokenizer();

// Prediction endpoint
app.post('/predict', authenticate, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).send('No text provided for prediction.');
        }

        // Preprocess the input text
        const maxLen = 100;
        const tokens = text.toLowerCase().split(' ').map(word => tokenizer.word_index[word] || 0);
        const paddedTokens = Array.from({ length: maxLen }, (_, i) => tokens[i] || 0);
        const inputTensor = tf.tensor2d([paddedTokens]);

        // Make the prediction
        const prediction = model.predict(inputTensor);
        const predictionArray = await prediction.array();

        res.json({ prediction: predictionArray[0][0] });
    } catch (error) {
        console.error('Error making prediction:', error);
        res.status(500).send('Error making prediction');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
