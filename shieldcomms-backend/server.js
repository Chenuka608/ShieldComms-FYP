const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
const DiscordMessage = require('./models/DiscordMessage');
const TelegramMessage = require('./models/TelegramMessage');
const EmailMessage = require('./models/EmailMessage');

const http = require('http'); // ⬅️ Required for socket.io
const { Server } = require('socket.io'); // ⬅️ Required for socket.io

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://shield-comms-fyp-t69w.vercel.app"],
    credentials: true,
  })
);

// ✅ FIX: define server BEFORE using in socket.io
const server = http.createServer(app);

// ⬅️ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://shield-comms-fyp-t69w.vercel.app"],
    methods: ["GET", "POST"]
  },
  path: "/socket.io"
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
});


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Middleware for authentication
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

// Auth & User routes
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).send('Error registering user');
  }
});

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
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(400).send('Error logging in');
  }
});

app.get('/account', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).send('Error fetching user data');
  }
});

app.put('/account', authenticate, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).send('Invalid current password');
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, updateData);
    res.send('Account updated successfully');
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).send('Internal server error');
  }
});

app.put('/user/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).send('User not found');
    if (req.user.id !== id) return res.status(403).send('Unauthorized to update this account');
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).send('Invalid current password');
    }

    const updateData = { email };
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, updateData);
    res.send('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).send('Error updating user');
  }
});

app.post('/check-phishing', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    // ✅ Calls FastAPI ML backend
    const response = await axios.post('https://shieldcomms-fyp.onrender.com/predict', { text });

    // ✅ Returns model result to frontend
    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).send('Prediction failed');
  }
});


// ===== DISCORD LOGIN =====
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;


app.get("/auth/discord", (req, res) => {
  const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(discordOAuthUrl);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
        scope: "identify"
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discordUser = userRes.data;

    const token = jwt.sign({ id: discordUser.id, discord: true }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.redirect(`https://shield-comms-fyp-t69w.vercel.app/application?token=${token}`);
  } catch (error) {
    console.error("Discord OAuth Error:", error.message);
    res.status(500).send("Login failed");
  }
});

// 🟢 Discord message logging + socket emit
app.post('/log-discord-message', async (req, res) => {
  try {
    const {
      userId,
      username,
      message,
      prediction,
      phishing_probability,
      non_phishing_probability
    } = req.body;

    const newEntry = new DiscordMessage({
      userId,
      username,
      message,
      prediction,
      phishing_probability,
      non_phishing_probability
    });

    await newEntry.save();

    io.emit("new_discord_message", newEntry); // 🟢 Emit real-time update

    res.status(201).json({ message: "Discord message saved to MongoDB" });
  } catch (error) {
    console.error("❌ Logging error:", error.message);
    res.status(500).json({ error: "Failed to log message" });
  }
});
// GET all Discord messages (for dashboard)
app.get('/api/discord/messages', authenticate, async (req, res) => {
  try {
    const messages = await DiscordMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
    res.status(500).send("Error fetching messages");
  }
});

app.post('/log-telegram-message', async (req, res) => {
  try {
    const {
      userId,
      username,
      message,
      prediction,
      phishing_probability,
      non_phishing_probability
    } = req.body;

    const newEntry = new TelegramMessage({
      userId,
      username,
      message,
      prediction,
      phishing_probability,
      non_phishing_probability
    });

    await newEntry.save();

    // Emit real-time event to frontend
    io.emit("new_telegram_message", newEntry);

    res.status(201).json({ message: "Telegram message logged" });
  } catch (error) {
    console.error("❌ Telegram logging error:", error.message);
    res.status(500).json({ error: "Failed to log Telegram message" });
  }
});
app.get('/api/telegram/messages', async (req, res) => {

  try {
    const messages = await TelegramMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("❌ Failed to fetch Telegram messages:", error.message);
    res.status(500).send("Error fetching Telegram messages");
  }
});

// 🟢 Email message logging + socket emit
app.post('/log-email-message', async (req, res) => {
  try {
    const {
      from,
      subject,
      body,
      prediction,
      phishing_probability,
      non_phishing_probability,
    } = req.body;

    const newEntry = new EmailMessage({
      from,
      subject,
      body,
      prediction,
      phishing_probability,
      non_phishing_probability,
    });

    await newEntry.save();

    io.emit("new_email_message", newEntry); // 🟢 Emit real-time update

    res.status(201).json({ message: "Email message logged" });
  } catch (error) {
    console.error("❌ Email logging error:", error.message);
    res.status(500).json({ error: "Failed to log Email message" });
  }
});

// GET all Email messages (for dashboard)
app.get('/api/email/messages', async (req, res) => {
  try {
    const messages = await EmailMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error("❌ Failed to fetch Email messages:", error.message);
    res.status(500).send("Error fetching Email messages");
  }
});



// 🔥 Start server (socket-compatible)
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
