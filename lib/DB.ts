import mongoose from 'mongoose';
import { revalidateTag, unstable_cache } from 'next/cache';

const MODS_LIST_TAG = 'mods:list';
const MODS_RANDOM_TAG = 'mods:random';

const modTagById = (id: string) => `mod:id:${id}`;
const modTagBySlug = (slug: string) => `mod:slug:${slug}`;
const modTagByName = (name: string) => `mod:name:${name.toLowerCase()}`;

function toStableFilterKey(filters: {
	search?: string;
	type?: string;
	brand?: string;
	game?: string;
	sort?: string;
}) {
	const normalized = {
		search: filters.search ?? '',
		type: filters.type ?? '',
		brand: filters.brand ?? '',
		game: filters.game ?? '',
		sort: filters.sort ?? '',
	};

	return JSON.stringify(normalized);
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
	const MONGODB_URI = process.env.MONGODB_URI || '';
	if (!MONGODB_URI) {
		throw new Error('Please define the MONGODB_URI environment variable');
	}
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
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
	},
	{ timestamps: true }
);

// Indexes for common filter/sort fields
modSchema.index({ date_added: -1 });
modSchema.index({ downloads: -1 });
modSchema.index({ mod_type: 1 });
modSchema.index({ brand: 1 });
modSchema.index({ game: 1 });
modSchema.index({ featured: -1, date_added: -1 });
modSchema.index({ name: 1, author: 1 }); // for regex search

const ModModel = mongoose.models.Mod || mongoose.model('Mod', modSchema);

function serializeModDoc(doc: any) {
	return {
		...doc,
		_id: String(doc._id),
		uploadedBy: doc.uploadedBy ? String(doc.uploadedBy) : null,
		updatedBy: doc.updatedBy ? String(doc.updatedBy) : null,
		date_added: doc.date_added ? new Date(doc.date_added).toISOString() : null,
		createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
		updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
	};
}

// ── DB helpers ──

export async function getAllMods() {
	return unstable_cache(
		async () => {
			await connectToDatabase();
			const docs = await ModModel.find().sort({ date_added: -1 }).lean();
			return docs.map(serializeModDoc);
		},
		['mods-all'],
		{ revalidate: 300, tags: [MODS_LIST_TAG] }
	)();
}

async function _getModsPaginated(
	page: number,
	perPage: number,
	filters: {
		search?: string;
		type?: string;
		brand?: string;
		game?: string;
		sort?: string;
	}
) {
	await connectToDatabase();

	// Build MongoDB filter query
	const query: Record<string, any> = {};
	if (filters.search) {
		const re = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		query.$or = [{ name: re }, { description: re }, { author: re }];
	}
	if (filters.type  && filters.type  !== 'all') query.mod_type = filters.type;
	if (filters.brand && filters.brand !== 'all') query.brand    = filters.brand;
	if (filters.game  && filters.game  !== 'all') query.game     = filters.game;

	// Build sort
	let sortQuery: Record<string, 1 | -1> = { date_added: -1 };
	if (filters.sort === 'oldest')    sortQuery = { date_added: 1 };
	if (filters.sort === 'downloads') sortQuery = { downloads: -1 };
	if (filters.sort === 'featured')  sortQuery = { featured: -1, date_added: -1 };

	// Only fetch fields the listing page actually needs
	const projection = {
		name: 1, author: 1, game: 1, mod_image: 1,
		downloads_size: 1, date_added: 1, brand: 1, mod_type: 1, slug: 1,
	};

	const skip = (page - 1) * perPage;
	const [docs, totalCount] = await Promise.all([
		ModModel.find(query, projection).sort(sortQuery).skip(skip).limit(perPage).lean(),
		ModModel.countDocuments(query),
	]);
	const mods = docs.map(serializeModDoc);
	return { mods, totalCount, totalPages: Math.ceil(totalCount / perPage), currentPage: page };
}

// Cached version: DB results revalidate every 60 seconds per unique page+filters combo
export async function getModsPaginated(
	page: number = 1,
	perPage: number = 12,
	filters: Parameters<typeof _getModsPaginated>[2] = {}
) {
	const filterKey = toStableFilterKey(filters);

	return unstable_cache(
		() => _getModsPaginated(page, perPage, filters),
		['mods-paginated', String(page), String(perPage), filterKey],
		{ revalidate: 60, tags: [MODS_LIST_TAG] }
	)();
}

export async function getModBySlug(slug: string) {
	return unstable_cache(
		async () => {
			await connectToDatabase();
			const doc = await ModModel.findOne({ slug }).lean();
			if (!doc) return null;
			return serializeModDoc(doc);
		},
		['mod-by-slug', slug],
		{ revalidate: 300, tags: [modTagBySlug(slug)] }
	)();
}

export async function getModById(id: string) {
	return unstable_cache(
		async () => {
			await connectToDatabase();
			const doc = await ModModel.findById(id).lean();
			if (!doc) return null;
			return serializeModDoc(doc);
		},
		['mod-by-id', id],
		{ revalidate: 300, tags: [modTagById(id)] }
	)();
}

export async function getModByName(name: string) {
	const normalizedName = name.trim();

	return unstable_cache(
		async () => {
			await connectToDatabase();
			const doc = await ModModel.findOne({ name: normalizedName }).lean();
			if (!doc) return null;
			return serializeModDoc(doc);
		},
		['mod-by-name', normalizedName],
		{ revalidate: 300, tags: [modTagByName(normalizedName)] }
	)();
}

export async function getRandomMods(excludeName: string, limit: number = 8) {
	return unstable_cache(
		async () => {
			await connectToDatabase();
			const docs = await ModModel.aggregate([
				{ $match: { name: { $ne: excludeName } } },
				{ $sample: { size: limit } },
			]);
			return docs.map(serializeModDoc);
		},
		['mods-random', excludeName, String(limit)],
		{ revalidate: 300, tags: [MODS_RANDOM_TAG] }
	)();
}

export async function invalidateModCaches(mod?: { id?: string; slug?: string; name?: string }) {
	revalidateTag(MODS_LIST_TAG, 'max');
	revalidateTag(MODS_RANDOM_TAG, 'max');

	if (!mod) return;

	if (mod.id) revalidateTag(modTagById(mod.id), 'max');
	if (mod.slug) revalidateTag(modTagBySlug(mod.slug), 'max');
	if (mod.name) revalidateTag(modTagByName(mod.name), 'max');
}
