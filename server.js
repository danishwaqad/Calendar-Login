const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const { verifyToken } = require('./app/middlewares/authJwt');
const Event = require('./app/models/event.model');
const router = require('./app/routes/event.routes');

const dbConfig = require("./app/config/db.config");
const app = express();

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
const { join } = require("path");

db.mongoose
    .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4
    })
    .then(() => {
      console.log("Successfully connect to MongoDB.");
      initial();
    })
    .catch(err => {
      console.error("Connection error", err);
      process.exit();
    });

app.use(express.static(join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
app.use('/api', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  // Your initialization logic here
}

router.post('/api/create-events', verifyToken, async (req, res) => {
  try {
    const { title, start, end } = req.body;
    const userId = req.userId;

    const event = new Event({
      title,
      start,
      end,
      user: userId
    });

    await event.save();

    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.get('/api/events', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const events = await Event.find({ user: userId });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

module.exports = router;
