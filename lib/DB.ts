import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
	if (cached.conn) return cached.conn;
	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URI, {
			bufferCommands: false,
		}).then((mongoose) => mongoose);
	}
	cached.conn = await cached.promise;
	(global as any).mongoose = cached;
	return cached.conn;
}

// ── Mod Schema & Model ──

const modSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String },
		author: { type: String },
		game: { type: String, enum: ['BeamNG.drive', 'Assetto Corsa'] },
		featured: { type: Boolean, default: false },
		downloads_size: { type: String },
		AD_link: { type: String },
		download_link: { type: String },
		mod_image: { type: String },
		images: [{ type: String }],
		date_added: { type: Date },
		downloads: { type: Number, default: 0 },
		ads_mode: { type: Number },
		brand: { type: String },
		mod_type: { type: String },
		slug: { type: String },
		tags: [{ type: String }],
		Virustotal_link: { type: String },
	},
	{ timestamps: true }
);

const ModModel = mongoose.models.Mod || mongoose.model('Mod', modSchema);

// ── DB helpers ──

export async function getAllMods() {
	await connectToDatabase();
	const docs = await ModModel.find().sort({ date_added: -1 }).lean();
	// Serialize Mongoose documents to plain objects
	return docs.map((doc: any) => ({
		...doc,
		_id: String(doc._id),
		date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
		createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
		updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
	}));
}

export async function getModsPaginated(page: number = 1, perPage: number = 12) {
	await connectToDatabase();
	const skip = (page - 1) * perPage;
	const [docs, totalCount] = await Promise.all([
		ModModel.find().sort({ date_added: -1 }).skip(skip).limit(perPage).lean(),
		ModModel.countDocuments(),
	]);
	const mods = docs.map((doc: any) => ({
		...doc,
		_id: String(doc._id),
		date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
		createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
		updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
	}));
	return { mods, totalCount, totalPages: Math.ceil(totalCount / perPage), currentPage: page };
}

export async function getModByName(name: string) {
	await connectToDatabase();
	const doc = await ModModel.findOne({ name }).lean();
	if (!doc) return null;
	return {
		...(doc as any),
		_id: String((doc as any)._id),
		date_added: (doc as any).date_added ? new Date((doc as any).date_added).toISOString() : null,
		createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : null,
		updatedAt: (doc as any).updatedAt ? new Date((doc as any).updatedAt).toISOString() : null,
	};
}

export async function getRandomMods(excludeName: string, limit: number = 8) {
	await connectToDatabase();
	const docs = await ModModel.aggregate([
		{ $match: { name: { $ne: excludeName } } },
		{ $sample: { size: limit } },
	]);
	return docs.map((doc: any) => ({
		...doc,
		_id: String(doc._id),
		date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
		createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
		updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
	}));
}
