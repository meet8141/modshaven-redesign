"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Gamepad2,
  HardDrive,
  Image as ImageIcon,
  Images,
  Info,
  Link2,
  ShieldCheck,
  Tag,
  UploadCloud,
  User,
} from "lucide-react";
import BrandIcon from "@/app/components/BrandIcon";

type UploadMode = "link" | "file";

const BRANDS = [
  "all", "Aston Martin", "Audi", "BMW", "Bugatti", "Chevrolet", "Dodge", "Ferrari",
  "Ford", "Honda", "Infiniti", "Kia", "Lamborghini", "Land Rover", "Lexus",
  "Lotus", "Mazda", "McLaren", "Mercedes", "Mitsubishi", "Nissan", "Pagani",
  "Peugeot", "Porsche", "Renault", "Subaru", "Toyota", "Volkswagen", "Volvo", "Skoda",
];

const MOD_TYPES = ["car", "truck", "maps"];

const GAMES = [
  { value: "BeamNG.drive", label: "BeamNG.drive" },
  { value: "Assetto Corsa", label: "Assetto Corsa" },
];

const MAX_IMAGE_MB = 10;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

const fieldClass = "w-full bg-black/45 border-2 border-white/10 rounded-[0.65rem] px-3 py-2.5 text-white outline-none transition-colors focus:border-[#ff6600]";
const labelClass = "text-xs font-bold uppercase tracking-widest text-white/50";
const sectionClass = "rounded-[0.95rem] border border-white/10 bg-black/25 p-4 md:p-5";

export default function AddModPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [openDropdown, setOpenDropdown] = useState<"game" | "brand" | "modType" | null>(null);

  const [uploadMode, setUploadMode] = useState<UploadMode>("link");
  const [game, setGame] = useState("BeamNG.drive");
  const [brand, setBrand] = useState("Other");
  const [modType, setModType] = useState("car");
  const [downloadSize, setDownloadSize] = useState("");
  const [urlImages, setUrlImages] = useState<string[]>([""]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [galleryImageUrls, setGalleryImageUrls] = useState<string[]>([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [virusTotalLink, setVirusTotalLink] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [primaryFileName, setPrimaryFileName] = useState("No file chosen");
  const [galleryFileName, setGalleryFileName] = useState("No file chosen");
  const [uploadFileName, setUploadFileName] = useState("No file chosen");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.closest("[data-dropdown-root='true']")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function exceedsImageLimit(file: File) {
    return file.size > MAX_IMAGE_BYTES;
  }

  async function uploadImageWithPresignedUrl(file: File) {
    try {
      const presignRes = await fetch("/api/upload/image/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
          folder: "mods",
        }),
      });

      const presignData = (await presignRes.json()) as {
        error?: string;
        uploadUrl?: string;
        publicUrl?: string;
      };

      if (!presignRes.ok || !presignData.uploadUrl || !presignData.publicUrl) {
        throw new Error(presignData.error ?? "Failed to prepare image upload");
      }

      const putRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error("Image upload failed");
      }

      return presignData.publicUrl;
    } catch (error: unknown) {
      // Browsers typically surface CORS/blocked cross-origin PUT as a generic "Failed to fetch" error.
      if (error instanceof TypeError) {
        throw new Error(
          "Direct image upload is blocked (likely R2 CORS). Falling back to server upload on submit."
        );
      }
      throw error;
    }
  }

  async function handleUploadFile(file: File) {
    setIsUploadingFile(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload/file", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        url?: string;
        size?: number;
        virusTotalScan?: { permalink?: string };
      };

      if (!res.ok || !data.success || !data.url) {
        setError(data.message ?? "File upload failed");
        return;
      }

      setDownloadLink(data.url);
      setVirusTotalLink(data.virusTotalScan?.permalink ?? "");
      if (typeof data.size === "number") {
        setDownloadSize(formatBytes(data.size));
      }
      setSuccess("File uploaded successfully. You can submit the mod now.");
    } catch {
      setError("Failed to upload file.");
    } finally {
      setIsUploadingFile(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const fd = new FormData(form);
    const primaryFile = fd.get("mod_image");
    const hasPrimaryFile = primaryFile instanceof File && primaryFile.size > 0;

    if (!primaryImageUrl && !hasPrimaryFile) {
      setError("Please upload or select a primary image before submitting.");
      setIsSubmitting(false);
      return;
    }

    if (primaryImageUrl) {
      fd.set("mod_image_url", primaryImageUrl);
      fd.delete("mod_image");
    }

    if (uploadMode === "file") {
      if (!downloadLink) {
        setError("Please upload your mod file first.");
        setIsSubmitting(false);
        return;
      }
      fd.set("Download_link", downloadLink);
      fd.set("Virustotal_link", virusTotalLink);
    }

    urlImages
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => fd.append("images_urls[]", value));

    galleryImageUrls.forEach((value) => fd.append("images_urls[]", value));
    if (galleryImageUrls.length > 0) {
      fd.delete("images");
    }

    try {
      const res = await fetch("/api/mods", {
        method: "POST",
        body: fd,
      });

      const data = (await res.json()) as { error?: string; slug?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to create mod");
        return;
      }

      setSuccess("Mod created successfully.");
      formRef.current?.reset();
      setGame("BeamNG.drive");
      setBrand("Other");
      setModType("car");
      setDownloadSize("");
      setOpenDropdown(null);
      setUrlImages([""]);
      setPrimaryImageUrl("");
      setGalleryImageUrls([]);
      setDownloadLink("");
      setVirusTotalLink("");
      setPrimaryFileName("No file chosen");
      setGalleryFileName("No file chosen");
      setUploadFileName("No file chosen");

      if (data.slug) {
        router.push(`/mods/${data.slug}`);
        router.refresh();
      }
    } catch {
      setError("Something went wrong while creating the mod.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "100px auto", padding: 24, position: "relative", zIndex: 1 }}>
      <div className="mb-6 rounded-[1rem] border-2 border-[#ff6600]/60 bg-gradient-to-r from-black/70 via-black/55 to-black/45 backdrop-blur-xl p-5 md:p-6">
        <p className="text-[#ff9b57] text-[0.72rem] font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Mods Management
        </p>
        <h1 className="text-[2rem] font-[900] leading-tight">Add New Mod</h1>
        <p className="text-[#ccd1db] mt-2 text-sm md:text-[0.95rem]">
          Admin and Moderator only. Upload mod media and choose either direct link mode or file upload mode.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-[1rem] border-2 border-[#ff6600] bg-black/40 backdrop-blur-xl p-5 md:p-7 flex flex-col gap-5 shadow-[0_0_28px_#ff66002b]"
      >
        <div className={sectionClass}>
          <p className="text-[#ff9b57] text-sm font-bold mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Basic Information
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Tag className="w-3.5 h-3.5" />Name</span>
              <input name="name" required minLength={3} maxLength={120} className={fieldClass} />
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><User className="w-3.5 h-3.5" />Author</span>
              <input name="author" required maxLength={80} className={fieldClass} />
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Gamepad2 className="w-3.5 h-3.5" />Game</span>
              <div className="relative" data-dropdown-root="true">
                <input type="hidden" name="game" value={game} />
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => prev === "game" ? null : "game")}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[0.6rem] text-sm font-semibold border-2 transition-all text-white ${openDropdown === "game" ? "border-[#ff6600] shadow-[0_0_10px_#ff660033]" : "border-white/10 hover:border-[#ff6600]/60"}`}
                >
                  <span>{game}</span>
                  <ChevronDown className={`w-4 h-4 text-[#ff6600] transition-transform duration-200 ${openDropdown === "game" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "game" && (
                  <div className="absolute z-50 mt-1 w-full rounded-[0.75rem] bg-black/80 backdrop-blur-lg border-2 border-[#ff6600]/60 shadow-[0_8px_32px_#ff660022] overflow-hidden">
                    {GAMES.map((gameOption) => {
                      const active = game === gameOption.value;
                      return (
                        <button
                          key={gameOption.value}
                          type="button"
                          onClick={() => {
                            setGame(gameOption.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 ${active ? "bg-[#ff6600] text-white font-bold" : "text-white/75 hover:bg-[#ff6600]/15 hover:text-white font-medium"}`}
                        >
                          <span>{gameOption.label}</span>
                          {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Download className="w-3.5 h-3.5" />Downloads</span>
              <input name="Downloads" type="number" min={0} defaultValue={0} className={fieldClass} />
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><HardDrive className="w-3.5 h-3.5" />Download Size</span>
              <input
                name="Download_size"
                required
                value={downloadSize}
                onChange={(event) => setDownloadSize(event.target.value)}
                placeholder="e.g. 260 MB"
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Car className="w-3.5 h-3.5" />Brand</span>
              <div className="relative" data-dropdown-root="true">
                <input type="hidden" name="brand" value={brand} />
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => prev === "brand" ? null : "brand")}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[0.6rem] text-sm font-semibold border-2 transition-all text-white ${openDropdown === "brand" ? "border-[#ff6600] shadow-[0_0_10px_#ff660033]" : "border-white/10 hover:border-[#ff6600]/60"}`}
                >
                  <span className="flex items-center gap-2">
                    {brand !== "Other" ? <BrandIcon brand={brand} width={18} height={18} /> : null}
                    {brand === "Other" ? "All Brands" : brand}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#ff6600] transition-transform duration-200 ${openDropdown === "brand" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "brand" && (
                  <div className="scrollbar-themed absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-[0.75rem] bg-black/80 backdrop-blur-lg border-2 border-[#ff6600]/60 shadow-[0_8px_32px_#ff660022]">
                    {BRANDS.map((brandItem) => {
                      const value = brandItem === "all" ? "Other" : brandItem;
                      const active = brand === value;
                      return (
                        <button
                          key={brandItem}
                          type="button"
                          onClick={() => {
                            setBrand(value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 first:rounded-t-[0.65rem] last:rounded-b-[0.65rem] ${active ? "bg-[#ff6600] text-white font-bold" : "text-white/75 hover:bg-[#ff6600]/15 hover:text-white font-medium"}`}
                        >
                          <span className="flex items-center gap-2.5">
                            {value !== "Other" ? <BrandIcon brand={value} width={18} height={18} /> : null}
                            {brandItem === "all" ? "All Brands" : brandItem}
                          </span>
                          {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Tag className="w-3.5 h-3.5" />Mod Type</span>
              <div className="relative" data-dropdown-root="true">
                <input type="hidden" name="mod_type" value={modType} />
                <button
                  type="button"
                  onClick={() => setOpenDropdown((prev) => prev === "modType" ? null : "modType")}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[0.6rem] text-sm font-semibold border-2 transition-all text-white ${openDropdown === "modType" ? "border-[#ff6600] shadow-[0_0_10px_#ff660033]" : "border-white/10 hover:border-[#ff6600]/60"}`}
                >
                  <span className="capitalize">{modType}</span>
                  <ChevronDown className={`w-4 h-4 text-[#ff6600] transition-transform duration-200 ${openDropdown === "modType" ? "rotate-180" : ""}`} />
                </button>

                {openDropdown === "modType" && (
                  <div className="absolute z-50 mt-1 w-full rounded-[0.75rem] bg-black/80 backdrop-blur-lg border-2 border-[#ff6600]/60 shadow-[0_8px_32px_#ff660022] overflow-hidden">
                    {MOD_TYPES.map((typeOption) => {
                      const active = modType === typeOption;
                      return (
                        <button
                          key={typeOption}
                          type="button"
                          onClick={() => {
                            setModType(typeOption);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 ${active ? "bg-[#ff6600] text-white font-bold" : "text-white/75 hover:bg-[#ff6600]/15 hover:text-white font-medium"}`}
                        >
                          <span className="capitalize">{typeOption}</span>
                          {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className={`${labelClass} flex items-center gap-1.5`}><Link2 className="w-3.5 h-3.5" />Ad Link</span>
              <input
               disabled={true}
                name="AD_link"
                type="url"
                defaultValue="https://sawutser.top/4/9283523"
                className={fieldClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 mt-4">
            <span className={`${labelClass} flex items-center gap-1.5`}><FileText className="w-3.5 h-3.5" />Description</span>
            <textarea
              name="description"
              required
              minLength={20}
              rows={6}
              className={fieldClass}
              placeholder="Detailed mod description"
            />
          </label>
        </div>

        <div className={`${sectionClass} grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <label className="flex flex-col gap-2">
            <span className={`${labelClass} flex items-center gap-1.5`}><ImageIcon className="w-3.5 h-3.5" />Primary Mod Image (required)</span>
            <div className="w-full rounded-[0.95rem] border border-white/10 bg-black/20 px-3 py-3 flex items-center gap-3">
              <label
                htmlFor="mod-image"
                className="shrink-0 cursor-pointer rounded-[0.85rem] border-2 border-[#ff6600] px-5 py-2 text-[1.05rem] font-[900] text-[#ff6600] transition-all hover:bg-[#ff6600] hover:text-white"
              >
                Choose File
              </label>
              <span className="truncate text-white text-[0.95rem] font-[700]">{primaryFileName}</span>
              <input
                id="mod-image"
                name="mod_image"
                type="file"
                accept="image/*"
                required
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    setPrimaryFileName("No file chosen");
                    setPrimaryImageUrl("");
                    return;
                  }

                  if (exceedsImageLimit(file)) {
                    setError(`Images larger than ${MAX_IMAGE_MB}MB are not allowed.`);
                    setPrimaryFileName("No file chosen");
                    event.currentTarget.value = "";
                    return;
                  }

                  setError("");
                  setPrimaryFileName(file.name);

                  try {
                    setIsUploadingImages(true);
                    const uploadedUrl = await uploadImageWithPresignedUrl(file);
                    setPrimaryImageUrl(uploadedUrl);
                    setSuccess("Primary image uploaded.");
                  } catch (uploadError: unknown) {
                    setPrimaryImageUrl("");
                    setError(uploadError instanceof Error ? uploadError.message : "Failed to upload primary image.");
                    setSuccess("Primary image will upload via server on submit.");
                  } finally {
                    setIsUploadingImages(false);
                  }
                }}
              />
            </div>
            {primaryImageUrl ? <p className="text-xs text-[#8fe28f] break-all">Uploaded: {primaryImageUrl}</p> : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className={`${labelClass} flex items-center gap-1.5`}><Images className="w-3.5 h-3.5" />Gallery Images (optional)</span>
            <div className="w-full rounded-[0.95rem] border border-white/10 bg-black/20 px-3 py-3 flex items-center gap-3">
              <label
                htmlFor="gallery-images"
                className="shrink-0 cursor-pointer rounded-[0.85rem] border-2 border-[#ff6600] px-5 py-2 text-[1.05rem] font-[900] text-[#ff6600] transition-all hover:bg-[#ff6600] hover:text-white"
              >
                Choose Files
              </label>
              <span className="truncate text-white text-[0.95rem] font-[700]">{galleryFileName}</span>
              <input
                id="gallery-images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  const count = files.length;
                  if (files.some(exceedsImageLimit)) {
                    setError(`Images larger than ${MAX_IMAGE_MB}MB are not allowed.`);
                    setGalleryFileName("No file chosen");
                    event.currentTarget.value = "";
                    return;
                  }
                  setError("");
                  if (count === 0) {
                    setGalleryFileName("No file chosen");
                    setGalleryImageUrls([]);
                    return;
                  }
                  if (count === 1) {
                    setGalleryFileName(event.target.files?.[0]?.name ?? "No file chosen");
                  } else {
                    setGalleryFileName(`${count} files selected`);
                  }

                  try {
                    setIsUploadingImages(true);
                    const uploadedUrls = await Promise.all(files.map((file) => uploadImageWithPresignedUrl(file)));
                    setGalleryImageUrls(uploadedUrls);
                    setSuccess(`Uploaded ${uploadedUrls.length} gallery image${uploadedUrls.length > 1 ? "s" : ""}.`);
                  } catch (uploadError: unknown) {
                    setGalleryImageUrls([]);
                    setError(uploadError instanceof Error ? uploadError.message : "Failed to upload gallery images.");
                    setSuccess("Gallery images will upload via server on submit.");
                  } finally {
                    setIsUploadingImages(false);
                  }
                }}
              />
            </div>
            {galleryImageUrls.length > 0 ? (
              <p className="text-xs text-[#8fe28f]">Uploaded {galleryImageUrls.length} gallery image{galleryImageUrls.length > 1 ? "s" : ""}.</p>
            ) : null}
          </label>
        </div>

        <div className="rounded-[0.95rem] border border-[#ff6600]/60 bg-black/20 p-4 md:p-5">
          <p className="text-[#ff9b57] text-sm font-bold mb-3 flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Download Source Mode
          </p>
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setUploadMode("link")}
              className={`rounded-[0.65rem] px-4 py-2 border-2 text-sm font-bold transition-all ${uploadMode === "link" ? "bg-[#ff6600] border-[#ff6600] text-white" : "border-white/20 text-white/75 hover:border-[#ff6600]/70"}`}
            >
              <span className="flex items-center gap-2"><Link2 className="w-4 h-4" />Link Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`rounded-[0.65rem] px-4 py-2 border-2 text-sm font-bold transition-all ${uploadMode === "file" ? "bg-[#ff6600] border-[#ff6600] text-white" : "border-white/20 text-white/75 hover:border-[#ff6600]/70"}`}
            >
              <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" />Upload File Mode</span>
            </button>
          </div>

          {uploadMode === "link" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className={`${labelClass} flex items-center gap-1.5`}><Link2 className="w-3.5 h-3.5" />Download Link</span>
                <input name="Download_link" type="url" required className={fieldClass} />
              </label>

              <label className="flex flex-col gap-2">
                <span className={`${labelClass} flex items-center gap-1.5`}><ShieldCheck className="w-3.5 h-3.5" />VirusTotal Link (optional)</span>
                <input name="Virustotal_link" type="url" className={fieldClass} />
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-2">
                <span className={`${labelClass} flex items-center gap-1.5`}><UploadCloud className="w-3.5 h-3.5" />Upload Mod File</span>
                <div className="w-full rounded-[0.95rem] border border-white/10 bg-black/20 px-3 py-3 flex items-center gap-3">
                  <label
                    htmlFor="upload-mod-file"
                    className="shrink-0 cursor-pointer rounded-[0.85rem] border-2 border-[#ff6600] px-5 py-2 text-[1.05rem] font-[900] text-[#ff6600] transition-all hover:bg-[#ff6600] hover:text-white"
                  >
                    Choose File
                  </label>
                  <span className="truncate text-white text-[0.95rem] font-[700]">{uploadFileName}</span>
                  <input
                    id="upload-mod-file"
                    type="file"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setError("");
                      setUploadFileName(file?.name ?? "No file chosen");
                      if (file) {
                        void handleUploadFile(file);
                      }
                    }}
                  />
                </div>
              </label>

              <input type="hidden" name="Download_link" value={downloadLink} readOnly />
              <input type="hidden" name="Virustotal_link" value={virusTotalLink} readOnly />

              <p className="text-sm text-[#cdd3de] break-all">Download Link: {downloadLink || "Not uploaded yet"}</p>
              <p className="text-sm text-[#cdd3de] break-all">VirusTotal: {virusTotalLink || "Not available"}</p>
              {isUploadingFile ? <p className="text-[#ffb074]">Uploading file...</p> : null}
            </div>
          )}
        </div>

        {error ? <p className="rounded-[0.7rem] border border-red-400/40 bg-red-500/10 px-3 py-2 text-red-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p> : null}
        {success ? <p className="rounded-[0.7rem] border border-green-400/40 bg-green-500/10 px-3 py-2 text-green-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || isUploadingFile || isUploadingImages}
          className="rounded-[0.85rem] border-2 border-[#ff6600] bg-[#ff6600] px-5 py-3 font-bold text-white transition-all hover:bg-[#e95d00] hover:border-[#e95d00] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Mod..." : isUploadingImages ? "Uploading Images..." : "Create Mod"}
        </button>
      </form>
    </main>
  );
}
