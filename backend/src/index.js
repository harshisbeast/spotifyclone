import express from "express";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import cron from "node-cron";

import { initializeSocket } from "./lib/socket.js";

import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);

app.use(express.json()); // to parse req.body
app.use(clerkMiddleware()); // this will add auth to req obj => req.auth
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, "tmp"),
		createParentPath: true,
		limits: {
			fileSize: 10 * 1024 * 1024, // 10MB  max file size
		},
	})
);

// cron jobs
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// error handler
app.use((err, req, res, next) => {
	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

httpServer.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
	connectDB();
});



// import express from "express";
// import dotenv from "dotenv";
// import { clerkMiddleware } from "@clerk/express";
// import fileUpload from "express-fileupload";
// import path from "path";
// import cors from "cors";
// import fs from "fs";
// import { createServer } from "http";
// import cron from "node-cron";

// import { initializeSocket } from "./lib/socket.js";
// import { connectDB } from "./lib/db.js";
// import userRoutes from "./routes/user.route.js";
// import adminRoutes from "./routes/admin.route.js";
// import authRoutes from "./routes/auth.route.js";
// import songRoutes from "./routes/song.route.js";
// import albumRoutes from "./routes/album.route.js";
// import statRoutes from "./routes/stat.route.js";

// // Load environment variables from .env file
// dotenv.config();

// const __dirname = path.resolve();
// const app = express();
// const PORT = process.env.PORT;

// // Create HTTP server for socket.io
// const httpServer = createServer(app);
// initializeSocket(httpServer);

// // CORS settings - allowing frontend (React) to communicate with backend
// app.use(
//     cors({
//         origin: "http://localhost:3000", // Change this to your frontend development server URL if necessary
//         credentials: true,
//     })
// );

// // Middleware to parse JSON requests
// app.use(express.json()); 

// // Clerk authentication middleware (add auth to req.auth)
// app.use(clerkMiddleware());

// // File upload middleware for handling file uploads (with file size limit of 10MB)
// app.use(
//     fileUpload({
//         useTempFiles: true,
//         tempFileDir: path.join(__dirname, "tmp"),
//         createParentPath: true,
//         limits: {
//             fileSize: 10 * 1024 * 1024, // Max file size: 10MB
//         },
//     })
// );

// // Cron job to clean up temporary files every hour
// const tempDir = path.join(process.cwd(), "tmp");
// cron.schedule("0 * * * *", () => {
//     if (fs.existsSync(tempDir)) {
//         fs.readdir(tempDir, (err, files) => {
//             if (err) {
//                 console.log("error", err);
//                 return;
//             }
//             for (const file of files) {
//                 fs.unlink(path.join(tempDir, file), (err) => {}); // Cleanup temp files
//             }
//         });
//     }
// });

// // Set up API routes for users, admin, authentication, songs, albums, and stats
// app.use("/api/users", userRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/songs", songRoutes);
// app.use("/api/albums", albumRoutes);
// app.use("/api/stats", statRoutes);

// // ** Development-specific changes **
// // In development, you typically don't need to serve static files from Express. Remove this block for now
// // if (process.env.NODE_ENV === "production") {
// //     app.use(express.static(path.join(__dirname, "../frontend/dist")));
// //     app.get("*", (req, res) => {
// //         res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
// //     });
// // }

// // Error handler middleware
// app.use((err, req, res, next) => {
//     res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
// });

// // Start the server and connect to the database
// httpServer.listen(PORT, () => {
//     console.log("Server is running on port " + PORT);
//     connectDB(); // Ensure DB connection is made
// });
