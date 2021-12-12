const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

// express inilialization
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// mongodb configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojcx0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// mongodb api
async function run() {
    try {
        await client.connect();
        const database = client.db("jad_travels");
        const tourCollection = database.collection("tours");
        const bookingCollection = database.collection("bookings");

        // ** TOUR DB API **
        // get all items
        app.get("/tours", async (req, res) => {
            const cursor = tourCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });

        // get single item
        app.get("/tours/:tourId", async (req, res) => {
            const id = req.params.tourId;
            const query = { _id: ObjectId(id) };
            const singleTour = await tourCollection.findOne(query);
            res.send(singleTour);
        });

        // add an item
        app.post("/tours", async (req, res) => {
            const tour = req.body;
            const singleTour = await tourCollection.insertOne(tour);
            res.json(singleTour);
        });

        // ** BOOKING DB API **
        // get items by current user email
        app.get("/bookings", async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        // get an item
        app.get("/bookings/:bookingId", async (req, res) => {
            const id = req.params.bookingId;
            const query = { _id: ObjectId(id) };
            const singleBooking = await bookingCollection.findOne(query);
            res.send(singleBooking)
        })

        // add an item
        app.post("/bookings", async (req, res) => {
            const bookings = req.body;
            const booking = await bookingCollection.insertOne(bookings);
            res.json(booking);
        });

        // update booking status
        app.put("/bookings/:bookingId", async (req, res) => {
            const id = req.params.bookingId;
            const updatedStatus = true;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedStatus
                },
            };
            const updateStatus = await bookingCollection.updateOne(query, updateDoc, options)
            res.send(updateStatus);
        })

        // delete an item
        app.delete("/bookings/:bookingId", async (req, res) => {
            const id = req.params.bookingId;
            const query = { _id: ObjectId(id) };
            const deleteBooking = await bookingCollection.deleteOne(query);
            res.send(deleteBooking)
        })
    }
    finally {
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});