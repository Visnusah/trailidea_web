const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Define User Schema (matching src/models/user.model.ts)
const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

const seedData = {
    firstName: "Kamlesh",
    lastName: "sah",
    username: "kks",
    email: "k@gmail.com",
    password: "Password@123",
    role: "user"
};

async function seedDatabase() {
    const mongoUri = process.env.MONGODB_URL || "mongodb://localhost:27017/trailidea_backend";
    console.log(`Connecting to MongoDB at: ${mongoUri}`);

    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB successfully!");

        // Remove any existing user with the same email or username to avoid duplicate key errors
        console.log("Cleaning up existing user with same email/username if any...");
        await User.deleteMany({
            $or: [
                { email: seedData.email },
                { username: seedData.username }
            ]
        });

        // Hash the password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(seedData.password, 10);
        
        // Create the user object with hashed password
        const userToInsert = {
            ...seedData,
            password: hashedPassword
        };

        // Insert seed user
        console.log("Inserting seed user...");
        const seededUser = await User.create(userToInsert);
        console.log("User seeded successfully:", {
            id: seededUser._id,
            firstName: seededUser.firstName,
            lastName: seededUser.lastName,
            username: seededUser.username,
            email: seededUser.email,
            role: seededUser.role,
            createdAt: seededUser.createdAt
        });

    } catch (error) {
        console.error("Error during database seeding:", error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedDatabase();
