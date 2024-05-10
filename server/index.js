import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { MongoClient, ServerApiVersion } from 'mongodb';
import session from 'express-session'; // Correct import for express-session


//routes
import authRoutes from './routes/auth.js';
import podcastsRoutes from './routes/podcast.js';
import userRoutes from './routes/user.js';

const app = express();
dotenv.config();

/** Middlewares */
app.use(express.json());
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(morgan('tiny'));
app.disable('x-powered-by');
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const port = process.env.PORT || 8700;

const connectMongoDB = async () => {
    try {
        const uri = "mongodb+srv://rismi:008215rismi@rismicluster.dlqcsnt.mongodb.net/?retryWrites=true&w=majority&appName=rismiCluster";
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        await client.connect();
        await client.db("podstream").command({ ping: 1 });
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

app.use(express.json());
app.use(session({ // Use express-session middleware
    secret: '123456',
    key: 'sid',
    proxy: true,
    cookie: {
        secure: true,
        maxAge: 5184000000 // 2 months
    }
}));

app.use("/api/auth", authRoutes);
app.use("/api/podcasts", podcastsRoutes);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message
    });
});

app.listen(port, () => {
    console.log("Server is running on port", port);
    connectMongoDB();
});
