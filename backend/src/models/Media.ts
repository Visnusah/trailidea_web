import mongoose, { Schema, Document } from "mongoose";

/**
 * ERD Entity: Media
 * Photo/media evidence attached to a TrailLog. Includes EXIF data.
 * Foreign Keys:
 * - log_id -> ref: 'TrailLog'
 */

export interface IMedia extends Document {
    log_id: mongoose.Types.ObjectId;
    file_url: string;
    exif_lat?: mongoose.Types.Decimal128;
    exif_long?: mongoose.Types.Decimal128;
    mismatch_flag: boolean;
    uploaded_at: Date;
}

const validateLatitude = {
    validator: function (v: mongoose.Types.Decimal128) {
        if (!v) return true; // Optional field
        const val = parseFloat(v.toString());
        return val >= -90 && val <= 90;
    },
    message: (props: any) => `${props.value} is not a valid latitude! Must be between -90 and 90.`
};

const validateLongitude = {
    validator: function (v: mongoose.Types.Decimal128) {
        if (!v) return true; // Optional field
        const val = parseFloat(v.toString());
        return val >= -180 && val <= 180;
    },
    message: (props: any) => `${props.value} is not a valid longitude! Must be between -180 and 180.`
};

const MediaSchema: Schema = new Schema<IMedia>(
    {
        log_id: {
            type: Schema.Types.ObjectId,
            ref: "TrailLog",
            required: true
        },
        file_url: {
            type: String,
            required: true
        },
        exif_lat: {
            type: Schema.Types.Decimal128,
            required: false,
            validate: validateLatitude,
            default: null
        },
        exif_long: {
            type: Schema.Types.Decimal128,
            required: false,
            validate: validateLongitude,
            default: null
        },
        mismatch_flag: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: "uploaded_at", updatedAt: false }
    }
);

// Index on log_id for queries
MediaSchema.index({ log_id: 1 });

// Pre-save hook: compare exif coordinates with parent TrailLog claimed coordinates
MediaSchema.pre("save", async function (next) {
    if (this.isModified("exif_lat") || this.isModified("exif_long") || this.isModified("log_id") || this.isNew) {
        if (this.exif_lat && this.exif_long) {
            try {
                // Fetch the parent TrailLog
                const TrailLog = mongoose.model("TrailLog");
                const parentLog = await TrailLog.findById(this.log_id);
                if (parentLog && parentLog.claimed_lat && parentLog.claimed_long) {
                    const claimedLat = parseFloat(parentLog.claimed_lat.toString());
                    const claimedLong = parseFloat(parentLog.claimed_long.toString());
                    const exifLat = parseFloat(this.exif_lat.toString());
                    const exifLong = parseFloat(this.exif_long.toString());

                    const latDiff = Math.abs(claimedLat - exifLat);
                    const longDiff = Math.abs(claimedLong - exifLong);

                    // Tolerance threshold of 0.01 degrees (approx 1.1km)
                    if (latDiff > 0.01 || longDiff > 0.01) {
                        this.mismatch_flag = true;
                    } else {
                        this.mismatch_flag = false;
                    }
                }
            } catch (error) {
                console.error("Error in Media pre-save mismatch check hook:", error);
            }
        }
    }
    next();
});

export const MediaModel = mongoose.model<IMedia>("Media", MediaSchema);
