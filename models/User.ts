import { createHmac, randomBytes } from "crypto";
import mongoose, { Document, Model, Schema, model, models } from "mongoose";
import { createTokenForUser, type UserRole } from "@/lib/jwt";

export interface IUser extends Document {
  fullName: string;
  email: string;
  salt?: string;
  password: string;
  profileImageURL: string;
  role: UserRole;
  roleHistory: {
    oldRole?: UserRole;
    newRole: UserRole;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {
  matchPasswordAndGenerateToken(identifier: string, password: string): Promise<string>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    salt: { type: String },
    password: { type: String, required: true },
    profileImageURL: { type: String, default: "/icon/logo_1.png" },
    role: {
      type: String,
      enum: ["USER", "MODERATOR", "ADMIN"],
      default: "USER",
    },
    roleHistory: [
      {
        oldRole: { type: String, enum: ["USER", "MODERATOR", "ADMIN"] },
        newRole: {
          type: String,
          enum: ["USER", "MODERATOR", "ADMIN"],
          required: true,
        },
        changedBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (identifier: string, password: string): Promise<string> {
    const normalized = identifier.trim();
    const fullNameRegex = new RegExp(`^${escapeRegex(normalized)}$`, "i");

    const user = await this.findOne({
      $or: [
        { fullName: fullNameRegex },
        { email: normalized.toLowerCase() },
      ],
    }).select(
      "salt password role email profileImageURL _id"
    );

    if (!user || !user.salt) {
      throw new Error("Invalid credentials");
    }

    const userProvidedHash = createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    if (user.password !== userProvidedHash) {
      throw new Error("Invalid credentials");
    }

    return createTokenForUser({
      _id: user._id,
      email: user.email,
      profileImageURL: user.profileImageURL,
      role: user.role,
    });
  }
);

const User = (models.user as IUserModel) || model<IUser, IUserModel>("user", userSchema);

export default User;
