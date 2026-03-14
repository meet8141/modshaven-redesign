"use client";

import { useState, useRef } from "react";
import { UserRound, Link2, Image as ImageIcon, X, ChevronDown } from "lucide-react";

const MOD_TYPES = ["BeamNG.drive", "Assetto Corsa"];

export default function SendClient() {
  const [form, setForm] = useState({
    discordUsername: "",
    modType: "",
    modName: "",
    authorName: "",
    downloadLink: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    const valid = files.filter((f) => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024);
    const combined = [...images, ...valid].slice(0, 5);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return combined.map((f) => URL.createObjectURL(f));
    });
    setImages(combined);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((imgs) => imgs.filter((_, i) => i !== index));
    setPreviews((ps) => ps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.discordUsername.trim() || !form.modType || !form.modName.trim() || !form.downloadLink.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("discordUsername", form.discordUsername.trim());
      fd.append("modType", form.modType);
      fd.append("modName", form.modName.trim());
      fd.append("authorName", form.authorName.trim());
      fd.append("downloadLink", form.downloadLink.trim());
      images.forEach((file) => fd.append("images", file));

      const resp = await fetch("/api/send", {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const d = await resp.json();
        throw new Error(d.error || "Submission failed");
      }

      setSuccess(true);
      setForm({ discordUsername: "", modType: "", modName: "", authorName: "", downloadLink: "" });
      previews.forEach((url) => URL.revokeObjectURL(url));
      setImages([]);
      setPreviews([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-24 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white">Request a Mod</h1>
          <p className="mt-2 text-[#a7a8b5] font-semibold">Share your favorite mods with the community</p>
        </div>

        {success ? (
          <div className="bg-black/50 backdrop-blur-lg border-2 border-[#ff6600] rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-[#ff6600] mb-2">Request Submitted!</h2>
            <p className="text-[#a7a8b5] font-semibold mb-6">
              Thank you! We&apos;ll review your mod request and add it to the library.
            </p>
            <button
              className="px-6 py-3 bg-[#ff6600] text-white font-bold rounded-xl hover:bg-[#ff5500] transition"
              onClick={() => setSuccess(false)}
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-black/60 backdrop-blur-lg border border-[#2a2a2a] rounded-2xl p-6 md:p-8 flex flex-col gap-7"
          >
            {/* ── Basic Information ── */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <UserRound className="text-[#ff6600] w-5 h-5" />
                <h2 className="text-[#ff6600] font-black text-lg">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Discord Username */}
                <div>
                  <label className="text-white font-semibold text-sm mb-1.5 block">
                    Discord Username <span className="text-[#ff6600]">*</span>
                  </label>
                  <input
                    type="text"
                    name="discordUsername"
                    value={form.discordUsername}
                    onChange={handleInput}
                    placeholder="e.g., username#1234"
                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] transition"
                  />
                </div>

                {/* Mod Type dropdown */}
                <div className="relative">
                  <label className="text-white font-semibold text-sm mb-1.5 block">
                    Mod Type <span className="text-[#ff6600]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setTypeOpen((o) => !o)}
                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-left text-sm rounded-xl px-4 py-3 flex items-center justify-between focus:outline-none focus:border-[#ff6600] transition"
                  >
                    <span className={form.modType ? "text-white" : "text-[#444]"}>
                      {form.modType || "Select Mod Type"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#ff6600] transition-transform ${typeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {typeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl overflow-hidden z-20 shadow-xl">
                      {MOD_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="w-full text-left px-4 py-3 text-sm text-[#ccc] hover:bg-[#ff6600]/20 hover:text-[#ff6600] transition"
                          onClick={() => {
                            setForm((f) => ({ ...f, modType: type }));
                            setTypeOpen(false);
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mod Name */}
              <div className="mb-4">
                <label className="text-white font-semibold text-sm mb-1.5 block">
                  Mod Name <span className="text-[#ff6600]">*</span>
                </label>
                <input
                  type="text"
                  name="modName"
                  value={form.modName}
                  onChange={handleInput}
                  placeholder="Enter the name of the mod"
                  className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] transition"
                />
              </div>

              {/* Author Name */}
              <div>
                <label className="text-white font-semibold text-sm mb-1.5 block">Author Name</label>
                <input
                  type="text"
                  name="authorName"
                  value={form.authorName}
                  onChange={handleInput}
                  placeholder="Credit the mod creator (optional)"
                  className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] transition"
                />
              </div>
            </section>

            {/* ── Download Information ── */}
            <section className="border-t border-[#1e1e1e] pt-6">
              <div className="flex items-center gap-2 mb-5">
                <Link2 className="text-[#ff6600] w-5 h-5" />
                <h2 className="text-[#ff6600] font-black text-lg">Download Information</h2>
              </div>

              <div>
                <label className="text-white font-semibold text-sm mb-1.5 block">
                  Download Link <span className="text-[#ff6600]">*</span>
                </label>
                <input
                  type="url"
                  name="downloadLink"
                  value={form.downloadLink}
                  onChange={handleInput}
                  placeholder="https://example.com/mod-download"
                  className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-white placeholder-[#444] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ff6600] transition"
                />
                <p className="text-[#606070] text-xs mt-2 font-semibold">
                  Please provide a direct, working download link to the mod
                </p>
              </div>
            </section>

            {/* ── Mod Screenshots ── */}
            <section className="border-t border-[#1e1e1e] pt-6">
              <div className="flex items-center gap-2 mb-5">
                <ImageIcon className="text-[#ff6600] w-5 h-5" />
                <h2 className="text-[#ff6600] font-black text-lg">Mod Screenshots</h2>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={handleImages}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 5}
                className="w-full border border-[#ff6600]/40 bg-[#ff6600]/10 text-[#ff6600] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ff6600]/20 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                <ImageIcon className="w-4 h-4" />
                Choose Images
              </button>
              <p className="text-[#606070] text-xs mt-2 font-semibold flex items-start gap-1">
                <span className="text-[#ff6600] text-sm leading-none">ⓘ</span>
                Upload up to 5 images in PNG, JPG, or WEBP format (max 5MB each)
              </p>

              <p className="text-white font-bold text-sm mt-4">
                Uploaded Images ({images.length}/5)
              </p>

              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#333]">
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 hover:bg-[#ff6600] transition"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-sm font-semibold bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#ff6600] hover:bg-[#ff5500] text-white font-black py-4 rounded-xl transition text-base tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
