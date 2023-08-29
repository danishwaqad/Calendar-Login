const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const { verifyToken } = require('./app/middlewares/authJwt');
const Event = require('./app/models/event.model'); // Create the Event model as needed
const router = require('./app/routes/event.routes'); // Import the event routes module

const dbConfig = require("./app/config/db.config");
const app = express(); // Initialize the Express app here

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
      name: "sparko-session",
      keys: ["COOKIE_SECRET"],
      httpOnly: true
    })
);

const db = require("./app/models");
const {join} = require("path");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family:4
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// Serve the static files from the "public" directory
app.use(express.static(join(__dirname, "public")));

// Define a route to handle the root URL
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
// Use the event routes module after initializing app
app.use('/api', router);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'admin' to roles collection");
      });
    }
  });
}

// Create an event
router.post('/api/create-events', verifyToken, async (req, res) => {
  try {
    const { title, start, end } = req.body;
    const userId = req.userId; // Get the user ID from the token

    const event = new Event({
      title,
      start,
      end,
      user: userId // Assign the event to the logged-in user
    });

    await event.save();

    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Fetch events for the logged-in user
router.get('/api/events', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from the token
    const events = await Event.find({ user: userId });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});
module.exports = router;
