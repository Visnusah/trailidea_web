import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { UserModel } from "./models/user.model";
import { PostModel } from "./models/post.model";

const MONGODB_URI = "mongodb://localhost:27017/trailidea_backend";

async function migrate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");

        const uploadsDir = path.join(__dirname, "uploads");
        const files = fs.readdirSync(uploadsDir);

        for (const file of files) {
            if (file.toLowerCase().endsWith(".heic") || file.toLowerCase().endsWith(".heif")) {
                const oldPath = path.join(uploadsDir, file);
                const newFilename = file.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
                const newPath = path.join(uploadsDir, newFilename);

                console.log(`Converting ${file} to ${newFilename} using sips...`);
                // Use macOS native sips to convert
                const { execSync } = require('child_process');
                execSync(`sips -s format jpeg "${oldPath}" --out "${newPath}"`);
                fs.unlinkSync(oldPath);
                console.log(`Successfully converted ${file}.`);
                console.log(`Successfully converted ${file}.`);
            }
        }

        console.log("Updating database records...");

        // Update Users
        const users = await UserModel.find({ 
            $or: [
                { imageUrl: { $regex: /\.heic$/i } },
                { coverImageUrl: { $regex: /\.heic$/i } },
                { imageUrl: { $regex: /\.HEIC$/i } },
                { coverImageUrl: { $regex: /\.HEIC$/i } }
            ]
        });

        for (const user of users) {
            let updated = false;
            if (user.imageUrl && user.imageUrl.toLowerCase().endsWith(".heic")) {
                user.imageUrl = user.imageUrl.replace(/\.heic$/i, ".jpg");
                updated = true;
            }
            if (user.coverImageUrl && user.coverImageUrl.toLowerCase().endsWith(".heic")) {
                user.coverImageUrl = user.coverImageUrl.replace(/\.heic$/i, ".jpg");
                updated = true;
            }
            if (updated) {
                await user.save();
                console.log(`Updated user ${user.username}`);
            }
        }

        // Update Posts
        const posts = await PostModel.find({
            imageUrls: { $regex: /\.heic$/i }
        });

        for (const post of posts) {
            let updated = false;
            const newImageUrls = post.imageUrls.map(url => {
                if (url.toLowerCase().endsWith(".heic")) {
                    updated = true;
                    return url.replace(/\.heic$/i, ".jpg");
                }
                return url;
            });

            if (updated) {
                post.imageUrls = newImageUrls;
                await post.save();
                console.log(`Updated post ${post._id}`);
            }
        }

        console.log("Migration complete!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
