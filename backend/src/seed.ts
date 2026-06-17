import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MONGODB_URL } from "./configs/constant";
import { UserModel } from "./models/user.model";
import { UserFollowModel } from "./models/UserFollow";
import { TrailLogModel } from "./models/TrailLog";
import { MediaModel } from "./models/Media";
import { CommentModel } from "./models/Comment";
import { VerificationVoteModel } from "./models/VerificationVote";
import { ModerationActionModel } from "./models/ModerationAction";

/**
 * Seeding Script for Trailidea Database
 * This script will populate the database with realistic test data for the 6 new models
 * and check/create Users as well.
 */

const SAMPLE_USERS = [
    {
        firstName: "Kamlesh",
        lastName: "Sah",
        username: "kamlesh_sah",
        email: "kamlesh@trailidea.com",
        password: "Password@123",
        role: "user"
    },
    {
        firstName: "Sushil",
        lastName: "Adhikari",
        username: "sushil_adhikari",
        email: "sushil@trailidea.com",
        password: "Password@123",
        role: "user"
    },
    {
        firstName: "Pooja",
        lastName: "Sharma",
        username: "pooja_sharma",
        email: "pooja@trailidea.com",
        password: "Password@123",
        role: "user"
    },
    {
        firstName: "Admin",
        lastName: "User",
        username: "admin_user",
        email: "admin@trailidea.com",
        password: "AdminPassword@123",
        role: "admin"
    }
];

async function seedDatabase() {
    const mongoUri = process.env.MONGODB_URL || MONGODB_URL;
    console.log(`[SEED] Connecting to MongoDB at: ${mongoUri}`);

    try {
        await mongoose.connect(mongoUri);
        console.log("[SEED] Connected to MongoDB successfully!");

        // 1. Clear existing documents from the 6 new collections
        console.log("[SEED] Cleaning up existing collections...");
        const deleteFollows = await UserFollowModel.deleteMany({});
        const deleteLogs = await TrailLogModel.deleteMany({});
        const deleteMedia = await MediaModel.deleteMany({});
        const deleteComments = await CommentModel.deleteMany({});
        const deleteVotes = await VerificationVoteModel.deleteMany({});
        const deleteModActions = await ModerationActionModel.deleteMany({});

        console.log(`[SEED] Deleted:
          - UserFollows: ${deleteFollows.deletedCount}
          - TrailLogs: ${deleteLogs.deletedCount}
          - Media: ${deleteMedia.deletedCount}
          - Comments: ${deleteComments.deletedCount}
          - VerificationVotes: ${deleteVotes.deletedCount}
          - ModerationActions: ${deleteModActions.deletedCount}`);

        // 2. Resolve Users
        let users = await UserModel.find({});
        if (users.length < SAMPLE_USERS.length) {
            console.log("[SEED] Less than standard sample users found. Ensuring all sample users are seeded...");
            for (const sampleUser of SAMPLE_USERS) {
                const existing = await UserModel.findOne({
                    $or: [{ email: sampleUser.email }, { username: sampleUser.username }]
                });
                if (!existing) {
                    const hashedPassword = await bcrypt.hash(sampleUser.password, 10);
                    await UserModel.create({
                        ...sampleUser,
                        password: hashedPassword
                    });
                    console.log(`[SEED] Created user: ${sampleUser.username} (${sampleUser.role})`);
                }
            }
            users = await UserModel.find({});
        } else {
            console.log(`[SEED] Found ${users.length} existing users. Reusing them.`);
        }

        // Map users by username for easy lookup
        const userMap: Record<string, any> = {};
        users.forEach((u) => {
            userMap[u.username] = u;
        });

        // Let's ensure we have our test usernames mapped or fallback to whatever users exist
        const u1 = userMap["kamlesh_sah"] || users[0];
        const u2 = userMap["sushil_adhikari"] || users[1] || users[0];
        const u3 = userMap["pooja_sharma"] || users[2] || users[1] || users[0];
        const admin = userMap["admin_user"] || users.find(u => u.role === "admin") || users[users.length - 1];

        if (!admin || admin.role !== "admin") {
            console.log("[SEED] WARNING: No admin user found. Setting role of user to admin for moderation seed...");
            admin.role = "admin";
            await admin.save();
        }

        // 3. Seed UserFollows
        console.log("[SEED] Seeding UserFollows...");
        const followsToInsert = [
            { follower_id: u1._id, followed_id: u2._id },
            { follower_id: u2._id, followed_id: u3._id },
            { follower_id: u3._id, followed_id: u1._id }
        ];
        const seededFollows = await UserFollowModel.insertMany(followsToInsert);
        console.log(`[SEED] Successfully seeded ${seededFollows.length} UserFollows.`);

        // 4. Seed TrailLogs
        console.log("[SEED] Seeding TrailLogs (Nepal region coordinates)...");
        const logsToInsert = [
            {
                author_id: u1._id,
                trail_name: "Annapurna Base Camp Loop",
                claimed_lat: mongoose.Types.Decimal128.fromString("28.5300"),
                claimed_long: mongoose.Types.Decimal128.fromString("83.8780"),
                journal_notes: "Stunning views of the Annapurna range. The weather was crisp and clear. Moderately challenging ascent.",
                peacefulness_rating: 5,
                difficulty_rating: 4,
                foot_traffic_rating: 3,
                status: "active" as const
            },
            {
                author_id: u2._id,
                trail_name: "Phulchoki Hill Trail",
                claimed_lat: mongoose.Types.Decimal128.fromString("27.5750"),
                claimed_long: mongoose.Types.Decimal128.fromString("85.4000"),
                journal_notes: "Highest hill in Kathmandu valley. Great hike through rhododendron forests. Highly peaceful on weekdays.",
                peacefulness_rating: 4,
                difficulty_rating: 3,
                foot_traffic_rating: 2,
                status: "active" as const
            },
            {
                author_id: u3._id,
                trail_name: "Shivapuri Peak Trail",
                claimed_lat: mongoose.Types.Decimal128.fromString("27.7890"),
                claimed_long: mongoose.Types.Decimal128.fromString("85.3780"),
                journal_notes: "Breathtaking panoramic view of Kathmandu city. A bit crowded near the start, but quieter as you go higher.",
                peacefulness_rating: 3,
                difficulty_rating: 3,
                foot_traffic_rating: 4,
                status: "active" as const
            },
            {
                author_id: u1._id,
                trail_name: "Champadevi Hiking Trail",
                claimed_lat: mongoose.Types.Decimal128.fromString("27.6400"),
                claimed_long: mongoose.Types.Decimal128.fromString("85.2600"),
                journal_notes: "Short day hike with beautiful ridge walks. Recommended for weekends.",
                peacefulness_rating: 4,
                difficulty_rating: 2,
                foot_traffic_rating: 3,
                status: "flagged" as const
            }
        ];

        // We use save() or create() rather than insertMany to trigger pre-save validation hooks if any,
        // although TrailLog doesn't have a custom pre-save, it's good practice.
        const seededLogs = await TrailLogModel.create(logsToInsert);
        console.log(`[SEED] Successfully seeded ${seededLogs.length} TrailLogs.`);

        // 5. Seed Media
        console.log("[SEED] Seeding Media files...");
        // Media matching coordinates (will have mismatch_flag = false)
        const media1 = new MediaModel({
            log_id: seededLogs[0]._id,
            file_url: "https://picsum.photos/seed/abc1/800/600",
            exif_lat: mongoose.Types.Decimal128.fromString("28.5305"),
            exif_long: mongoose.Types.Decimal128.fromString("83.8785")
        });
        const media2 = new MediaModel({
            log_id: seededLogs[0]._id,
            file_url: "https://picsum.photos/seed/abc2/800/600",
            exif_lat: mongoose.Types.Decimal128.fromString("28.5295"),
            exif_long: mongoose.Types.Decimal128.fromString("83.8775")
        });
        const media3 = new MediaModel({
            log_id: seededLogs[1]._id,
            file_url: "https://picsum.photos/seed/phul1/800/600",
            exif_lat: mongoose.Types.Decimal128.fromString("27.5752"),
            exif_long: mongoose.Types.Decimal128.fromString("85.4005")
        });

        // Media with coordinates mismatching by a lot (will trigger mismatch_flag = true in hook)
        const media4 = new MediaModel({
            log_id: seededLogs[2]._id,
            file_url: "https://picsum.photos/seed/shiva1/800/600",
            exif_lat: mongoose.Types.Decimal128.fromString("28.7890"), // Diff is 1 degree!
            exif_long: mongoose.Types.Decimal128.fromString("86.3780") // Diff is 1 degree!
        });

        // Media without EXIF coordinates (will have mismatch_flag = false)
        const media5 = new MediaModel({
            log_id: seededLogs[3]._id,
            file_url: "https://picsum.photos/seed/champa1/800/600",
            exif_lat: null,
            exif_long: null
        });

        await media1.save();
        await media2.save();
        await media3.save();
        await media4.save();
        await media5.save();

        console.log(`[SEED] Successfully seeded 5 Media documents.
          - Media 1 Mismatch: ${media1.mismatch_flag} (Expected: false)
          - Media 2 Mismatch: ${media2.mismatch_flag} (Expected: false)
          - Media 3 Mismatch: ${media3.mismatch_flag} (Expected: false)
          - Media 4 Mismatch: ${media4.mismatch_flag} (Expected: true - actual coordinates mismatch)
          - Media 5 Mismatch: ${media5.mismatch_flag} (Expected: false - no EXIF)`);

        // 6. Seed Comments
        console.log("[SEED] Seeding Comments...");
        const commentsToInsert = [
            {
                log_id: seededLogs[0]._id,
                user_id: u2._id,
                content: "Wow, the photos look amazing! I want to visit next month."
            },
            {
                log_id: seededLogs[0]._id,
                user_id: u3._id,
                content: "Did you need any special permit for this route?"
            },
            {
                log_id: seededLogs[1]._id,
                user_id: u1._id,
                content: "Agreed, Shivapuri is beautiful but Phulchoki is so much more peaceful."
            },
            {
                log_id: seededLogs[2]._id,
                user_id: u2._id,
                content: "Is there any water source along this path?"
            }
        ];
        const seededComments = await CommentModel.insertMany(commentsToInsert);
        console.log(`[SEED] Successfully seeded ${seededComments.length} Comments.`);

        // 7. Seed VerificationVotes
        console.log("[SEED] Seeding VerificationVotes...");
        const votesToInsert = [
            {
                log_id: seededLogs[0]._id,
                user_id: u2._id,
                vote_type: "verify" as const
            },
            {
                log_id: seededLogs[0]._id,
                user_id: u3._id,
                vote_type: "verify" as const
            },
            {
                log_id: seededLogs[1]._id,
                user_id: u1._id,
                vote_type: "verify" as const
            },
            {
                log_id: seededLogs[2]._id,
                user_id: u2._id,
                vote_type: "contest" as const // Contesting Shivapuri due to EXIF coordinates mismatch
            },
            {
                log_id: seededLogs[3]._id,
                user_id: u3._id,
                vote_type: "contest" as const
            }
        ];
        const seededVotes = await VerificationVoteModel.insertMany(votesToInsert);
        console.log(`[SEED] Successfully seeded ${seededVotes.length} VerificationVotes.`);

        // 8. Seed ModerationActions
        console.log("[SEED] Seeding ModerationActions...");
        const action1 = new ModerationActionModel({
            admin_id: admin._id,
            target_log_id: seededLogs[0]._id,
            action_type: "approve",
            reason: "Log verified by multiple users and EXIF matches.",
            resolved_at: new Date()
        });

        const action2 = new ModerationActionModel({
            admin_id: admin._id,
            target_user_id: u1._id,
            action_type: "suspend",
            reason: "Suspected of upload coordinates spoofing on another post.",
            resolved_at: new Date()
        });

        const action3 = new ModerationActionModel({
            admin_id: admin._id,
            target_log_id: seededLogs[3]._id,
            action_type: "delete_post",
            reason: "Post deleted due to persistent flagged status and community reports.",
            resolved_at: new Date()
        });

        await action1.save();
        await action2.save();
        await action3.save();

        console.log("[SEED] Successfully seeded 3 ModerationActions.");
        console.log("[SEED] DATABASE SEEDING COMPLETED SUCCESSFULLY!");

    } catch (error) {
        console.error("[SEED] Error during database seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("[SEED] Disconnected from MongoDB.");
    }
}

seedDatabase();
