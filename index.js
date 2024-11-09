const express = require("express");
const urlRoute = require("./routes/user");
const URL = require("./modles/url");
//const mongoose = require("mongoose"); // Assuming you're using Mongoose
const app = express();
const {connect}=require("./connection");
const PORT = 8001;

// MongoDB connection
connect("mongodb://localhost:27017/short-url", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected!");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/url", urlRoute);
app.get("/:shortId", async (req, res) => {
    const shortID = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortID },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true } // This option returns the updated document
        );

        if (!entry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        // Redirect to the original URL
        res.redirect(entry.redirectURL);
    } catch (error) {
        console.error("Error retrieving the short URL:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at PORT: ${PORT}`);
});
