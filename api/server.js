const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables if dotenv is present
try {
  require('dotenv').config();
} catch (e) {
  console.log("dotenv not found or error loading, continuing with environment variables");
}

const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Message = require('./models/Message');

const DB_PATH = path.join(__dirname, 'db.json');
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

let useMongoDB = false;

// Read local database
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading local database:", err);
  }
  return { appointments: [], messages: [] };
}

// Write local database
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error writing local database:", err);
    return false;
  }
}

// Seed MongoDB if empty and local data exists
async function seedMongoDBIfEmpty() {
  try {
    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0) {
      console.log("MongoDB database is empty. Seeding from local db.json...");
      const localData = readDB();
      if (localData.appointments && localData.appointments.length > 0) {
        await Appointment.insertMany(localData.appointments);
        console.log(`Seeded ${localData.appointments.length} appointments to MongoDB.`);
      }
      if (localData.messages && localData.messages.length > 0) {
        await Message.insertMany(localData.messages);
        console.log(`Seeded ${localData.messages.length} messages to MongoDB.`);
      }
    }
  } catch (err) {
    console.error("Error seeding MongoDB:", err);
  }
}

// Connect to MongoDB if URI is provided
if (MONGODB_URI) {
  console.log("Attempting to connect to MongoDB Atlas...");
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log("Successfully connected to MongoDB Atlas!");
      useMongoDB = true;
      await seedMongoDBIfEmpty();
    })
    .catch(err => {
      console.error("Failed to connect to MongoDB Atlas. Falling back to local file database.", err.message);
      useMongoDB = false;
    });
} else {
  console.log("No MONGODB_URI found in environment. Using local file database (db.json).");
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle Options preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/data
  if (req.url === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (useMongoDB) {
      try {
        const appointments = await Appointment.find({});
        const messages = await Message.find({});
        res.end(JSON.stringify({ appointments, messages }));
      } catch (err) {
        console.error("MongoDB GET error:", err);
        // Fallback to local db in case of live query error
        res.end(JSON.stringify(readDB()));
      }
    } else {
      res.end(JSON.stringify(readDB()));
    }
    return;
  }

  // POST /api/data
  if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const newData = JSON.parse(body);
        if (newData && (newData.appointments || newData.messages)) {
          if (useMongoDB) {
            try {
              if (newData.appointments) {
                for (const app of newData.appointments) {
                  // Perform upsert by custom id
                  await Appointment.findOneAndUpdate(
                    { id: app.id },
                    app,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                  );
                }
              }
              if (newData.messages) {
                await Message.deleteMany({});
                if (newData.messages.length > 0) {
                  await Message.insertMany(newData.messages);
                }
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, database: 'mongodb', data: newData }));
            } catch (err) {
              console.error("MongoDB POST error:", err);
              // Fallback to local write on connection drop
              writeDB(newData);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, database: 'local_fallback', data: newData }));
            }
          } else {
            writeDB(newData);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, database: 'local', data: newData }));
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Invalid data format" }));
        }
      } catch (err) {
        console.error("JSON Parse or server error:", err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Malformed JSON or server error" }));
      }
    });
    return;
  }

  // Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, () => {
  console.log(`Service Proof API Server running on port ${PORT}`);
});
