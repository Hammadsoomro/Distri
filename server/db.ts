import mongoose, { Schema } from "mongoose";

const uri = process.env.MONGODB_URI;

export async function connectDB() {
  if (!uri) {
    console.warn("MONGODB_URI not set; skipping MongoDB connection");
    return;
  }
  try {
    await mongoose.connect(uri, {} as any);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// Schemas
const MessageSchema = new Schema({
  text: { type: String, required: true },
  fromId: { type: String, default: null },
  ts: { type: Number, default: () => Date.now() },
  readBy: { type: [String], default: [] },
  conversationId: { type: String, default: null },
});

const ConversationSchema = new Schema({
  name: { type: String },
  participantIds: { type: [String], default: [] },
  isGroup: { type: Boolean, default: false },
  messages: { type: [MessageSchema], default: [] },
});

const UserSchema = new Schema({
  name: String,
  email: { type: String, index: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "member"], default: "member" },
  inbox: { type: [MessageSchema], default: [] },
});

const JobSchema = new Schema({
  ownerId: String,
  createdAt: Number,
  intervalSec: Number,
  linesPerTick: Number,
  targets: [String],
  textLines: [String],
  nextIndex: Number,
  status: { type: String, enum: ["running", "completed", "cancelled"] },
});

const PrefsSchema = new Schema({
  userId: { type: String, index: true, unique: true },
  sidebarCollapsed: { type: Boolean, default: false },
});

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const ConversationModel =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);
export const JobModel = mongoose.models.Job || mongoose.model("Job", JobSchema);
export const PrefsModel =
  mongoose.models.Prefs || mongoose.model("Prefs", PrefsSchema);

export default mongoose;
