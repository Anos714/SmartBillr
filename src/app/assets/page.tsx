"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2, Upload, PenLine, Image as ImageIcon } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { AppShell } from "@/components/AppShell";
import { CardIcon } from "@/components/icons";
import { useGuestStore, DEFAULT_DETAILS_KEY } from "@/lib/guest-store";
import { useSession } from "@/lib/auth-client";
import {
  createRemoteAsset,
  deleteRemoteAsset,
  fetchRemoteAssets,
  type RemoteAsset,
} from "@/lib/sync-client";

const LOGOS_KEY = "smartbillr_logos";
const SIGNATURES_KEY = "smartbillr_signatures";
const PUBLIC_IDS_KEY = "smartbillr_public_ids";
const MAX_LOGO_BYTES = 400 * 1024;
const MAX_SIG_UPLOAD_BYTES = 150 * 1024;

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const cloudConfigured = Boolean(CLOUD_NAME);

const inputCls =
  "w-full rounded-xl border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#141412] shadow-[inset_0_1px_2px_rgba(20,20,18,0.04)] outline-none transition placeholder:text-stone-400 focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/25";
const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3f3c37]";
const serif = { fontFamily: "var(--font-display), Georgia, serif" } as const;

type DetailsForm = {
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  gstin: string;
  logoUrl: string;
  billToName: string;
  billToEmail: string;
  billToAddress: string;
};

const EMPTY_DETAILS: DetailsForm = {
  fromName: "",
  fromEmail: "",
  fromAddress: "",
  gstin: "",
  logoUrl: "",
  billToName: "",
  billToEmail: "",
  billToAddress: "",
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStringList(key: string): string[] {
  const v = readJson<unknown>(key, []);
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function readPublicIds(): Record<string, string> {
  const v = readJson<unknown>(PUBLIC_IDS_KEY, {});
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string") out[k] = val;
    }
    return out;
  }
  return {};
}

type SignResponse =
  | {
      cloudName: string;
      apiKey: string;
      timestamp: string;
      folder: string;
      eager: string;
      signature: string;
    }
  | { error: string };

async function uploadViaCloudinary(
  file: File,
): Promise<{ secure_url: string; public_id: string } | null> {
  try {
    const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
    if (!signRes.ok) return null;
    const sign = (await signRes.json()) as SignResponse;
    if (!("signature" in sign)) return null;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sign.apiKey);
    form.append("timestamp", sign.timestamp);
    form.append("folder", sign.folder);
    form.append("eager", sign.eager);
    form.append("signature", sign.signature);
    const up = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      { method: "POST", body: form },
    );
    if (!up.ok) return null;
    const j = (await up.json()) as {
      secure_url?: string;
      public_id?: string;
      eager?: Array<{ secure_url?: string }>;
    };
    const url = j.eager?.[0]?.secure_url ?? j.secure_url;
    if (!url || !j.public_id) return null;
    return { secure_url: url, public_id: j.public_id };
  } catch {
    return null;
  }
}

function AssetImg({
  src,
  publicId,
  alt,
}: {
  src: string;
  publicId?: string;
  alt: string;
}) {
  if (publicId && cloudConfigured) {
    return (
      <CldImage
        src={publicId}
        width={300}
        height={100}
        alt={alt}
        className="h-20 w-full rounded-lg object-contain"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="h-20 w-full rounded-lg object-contain" />;
}

export default function AssetsPage() {
  const setInvoice = useGuestStore((s) => s.setInvoice);
  const { data: session } = useSession();
  // Logged-in users persist logos/signatures to /api/assets-db (DB lists only);
  // guests keep using localStorage only.
  const isAccount = Boolean(session?.user);
  const [details, setDetails] = useState<DetailsForm>(EMPTY_DETAILS);
  const [logos, setLogos] = useState<string[]>([]);
  const [signatures, setSignatures] = useState<string[]>([]);
  const [publicIds, setPublicIds] = useState<Record<string, string>>({});
  const [remoteAssets, setRemoteAssets] = useState<RemoteAsset[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const d = readJson<Partial<DetailsForm>>(DEFAULT_DETAILS_KEY, {});
      setDetails({ ...EMPTY_DETAILS, ...d });
      setLogos(readStringList(LOGOS_KEY));
      setSignatures(readStringList(SIGNATURES_KEY));
      setPublicIds(readPublicIds());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const refreshRemoteAssets = async () => {
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      setRemoteAssets(await fetchRemoteAssets());
    } catch {
      setRemoteError("Could not load account assets");
      setToast("Could not load account assets");
    } finally {
      setRemoteLoading(false);
    }
  };

  useEffect(() => {
    if (!isAccount) return;
    const id = requestAnimationFrame(() => {
      void refreshRemoteAssets();
    });
    return () => cancelAnimationFrame(id);
  }, [isAccount]);

  const shownLogos = isAccount
    ? remoteAssets.filter((a) => a.type === "logo").map((a) => a.url)
    : logos;
  const shownSignatures = isAccount
    ? remoteAssets.filter((a) => a.type === "signature").map((a) => a.url)
    : signatures;
  const shownPublicIds: Record<string, string> = isAccount
    ? Object.fromEntries(
        remoteAssets
          .filter((a) => typeof a.publicId === "string" && a.publicId)
          .map((a) => [a.url, a.publicId as string]),
      )
    : publicIds;

  const addLogoUrl = (url: string, publicId?: string) => {
    if (isAccount) {
      setUploading(true);
      void createRemoteAsset({ type: "logo", url, publicId })
        .then(() => {
          setToast("Logo saved to account");
          return refreshRemoteAssets();
        })
        .catch(() => setToast("Logo save failed"))
        .finally(() => setUploading(false));
      return;
    }
    persistLogos([...logos, url]);
    setToast("Logo added");
  };

  const addSignatureUrl = (url: string, publicId?: string) => {
    if (isAccount) {
      setUploading(true);
      void createRemoteAsset({ type: "signature", url, publicId })
        .then(() => {
          setToast("Signature saved to account");
          return refreshRemoteAssets();
        })
        .catch(() => setToast("Signature save failed"))
        .finally(() => setUploading(false));
      return;
    }
    persistSignatures([...signatures, url]);
    setToast("Signature added");
  };

  const set = (k: keyof DetailsForm) => (v: string) =>
    setDetails((d) => ({ ...d, [k]: v }));

  const handleSaveDetails = () => {
    try {
      localStorage.setItem(DEFAULT_DETAILS_KEY, JSON.stringify(details));
      setToast("Details saved");
    } catch {
      setToast("Save failed");
    }
  };

  const persistPublicIds = (next: Record<string, string>) => {
    setPublicIds(next);
    try {
      localStorage.setItem(PUBLIC_IDS_KEY, JSON.stringify(next));
    } catch {
      // non-fatal
    }
  };

  const persistLogos = (next: string[]) => {
    setLogos(next);
    try {
      localStorage.setItem(LOGOS_KEY, JSON.stringify(next));
    } catch {
      setToast("Storage full — logo not saved");
    }
  };

  const persistSignatures = (next: string[]) => {
    setSignatures(next);
    try {
      localStorage.setItem(SIGNATURES_KEY, JSON.stringify(next));
    } catch {
      setToast("Storage full — signature not saved");
    }
  };

  const removeLogo = (i: number) => {
    if (isAccount) {
      const url = shownLogos[i];
      const row = remoteAssets.find((a) => a.type === "logo" && a.url === url);
      if (!row) {
        setToast("Remove failed");
        return;
      }
      void deleteRemoteAsset(row.id)
        .then(() => {
          setToast("Logo removed");
          return refreshRemoteAssets();
        })
        .catch(() => setToast("Remove failed"));
      return;
    }
    const src = logos[i];
    const pid = publicIds[src];
    persistLogos(logos.filter((_, j) => j !== i));
    if (pid) {
      setToast("Removed from list (cloud copy retained)");
      const next = { ...publicIds };
      delete next[src];
      persistPublicIds(next);
    }
  };

  const removeSignature = (i: number) => {
    if (isAccount) {
      const url = shownSignatures[i];
      const row = remoteAssets.find(
        (a) => a.type === "signature" && a.url === url,
      );
      if (!row) {
        setToast("Remove failed");
        return;
      }
      void deleteRemoteAsset(row.id)
        .then(() => {
          setToast("Signature removed");
          return refreshRemoteAssets();
        })
        .catch(() => setToast("Remove failed"));
      return;
    }
    const src = signatures[i];
    const pid = publicIds[src];
    persistSignatures(signatures.filter((_, j) => j !== i));
    if (pid) {
      setToast("Removed from list (cloud copy retained)");
      const next = { ...publicIds };
      delete next[src];
      persistPublicIds(next);
    }
  };

  const dataUrlFallbackLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (isAccount) {
          addLogoUrl(reader.result);
        } else {
          persistLogos([...logos, reader.result]);
          setToast("Logo added");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const acceptLogoFile = (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setToast("Only PNG or JPG allowed");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setToast("Logo must be ≤ 400KB");
      return;
    }
    if (!cloudConfigured) {
      dataUrlFallbackLogo(file);
      return;
    }
    setUploading(true);
    void uploadViaCloudinary(file)
      .then((res) => {
        if (res) {
          if (isAccount) {
            addLogoUrl(res.secure_url, res.public_id);
          } else {
            persistPublicIds({ ...publicIds, [res.secure_url]: res.public_id });
            persistLogos([...logos, res.secure_url]);
            setToast("Logo uploaded to Cloudinary");
          }
        } else {
          dataUrlFallbackLogo(file);
        }
      })
      .finally(() => {
        if (!isAccount) setUploading(false);
      });
  };

  const dataUrlFallbackSig = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (isAccount) {
          addSignatureUrl(reader.result);
        } else {
          persistSignatures([...signatures, reader.result]);
          setToast("Signature added");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const acceptSignatureFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast("Only image files allowed");
      return;
    }
    if (file.size > MAX_SIG_UPLOAD_BYTES) {
      setToast("Signature must be ≤ 150KB");
      return;
    }
    if (!cloudConfigured) {
      dataUrlFallbackSig(file);
      return;
    }
    setUploading(true);
    void uploadViaCloudinary(file)
      .then((res) => {
        if (res) {
          if (isAccount) {
            addSignatureUrl(res.secure_url, res.public_id);
          } else {
            persistPublicIds({ ...publicIds, [res.secure_url]: res.public_id });
            persistSignatures([...signatures, res.secure_url]);
            setToast("Signature uploaded to Cloudinary");
          }
        } else {
          dataUrlFallbackSig(file);
        }
      })
      .finally(() => {
        if (!isAccount) setUploading(false);
      });
  };

  const canvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    lastPos.current = canvasPos(e);
    setDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const p = canvasPos(e);
    ctx.strokeStyle = "#141412";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPos.current = p;
  };

  const stopDrawing = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (isAccount) {
      addSignatureUrl(dataUrl);
    } else {
      persistSignatures([...signatures, dataUrl]);
      setToast("Signature saved");
    }
    handleClearCanvas();
  };

  return (
    <AppShell title="Manage Assets" icon={<CardIcon size={20} />} backHref="/dashboard">
      <div className="space-y-5">
        {isAccount ? (
          <p className="rounded-2xl border border-[#0C6B4F]/25 bg-[#0C6B4F]/5 px-4 py-3 text-xs font-semibold text-[#0C6B4F]">
            {remoteLoading
              ? "Loading account assets…"
              : "Saving to your account (synced across devices)."}{" "}
            {remoteError ? (
              <button
                type="button"
                onClick={() => void refreshRemoteAssets()}
                className="underline hover:no-underline"
              >
                Retry
              </button>
            ) : null}
          </p>
        ) : null}
        {!cloudConfigured ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-4 py-3 text-xs text-stone-500">
            Cloudinary not configured — uploads stay in this browser
            (dataURL). Add Cloudinary keys in .env.local for cloud uploads
            with f_auto/q_auto (300×100 eager for logos).
          </p>
        ) : null}
        {/* Default Details */}
        <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)] sm:p-6">
          <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
            Default Details
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Prefilled from your saved defaults. Used for new invoices.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-bold tracking-widest text-[#0C6B4F] uppercase">
                Company
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Name</label>
                  <input className={inputCls} value={details.fromName} onChange={(e) => set("fromName")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} value={details.fromEmail} onChange={(e) => set("fromEmail")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <textarea className={inputCls} rows={2} value={details.fromAddress} onChange={(e) => set("fromAddress")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>GSTIN</label>
                  <input className={inputCls} value={details.gstin} onChange={(e) => set("gstin")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Logo URL</label>
                  <input className={inputCls} value={details.logoUrl} onChange={(e) => set("logoUrl")(e.target.value)} placeholder="https://…/logo.png" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-bold tracking-widest text-[#0C6B4F] uppercase">
                Client
              </h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Name</label>
                  <input className={inputCls} value={details.billToName} onChange={(e) => set("billToName")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input className={inputCls} value={details.billToEmail} onChange={(e) => set("billToEmail")(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <textarea className={inputCls} rows={2} value={details.billToAddress} onChange={(e) => set("billToAddress")(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveDetails}
            className="mt-5 rounded-xl bg-[#0C6B4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a5a42]"
          >
            Save Details
          </button>
        </section>

        {/* Logos */}
        <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)] sm:p-6">
          <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
            Logos
          </h2>
          <p className="mt-1 text-xs text-stone-500">PNG or JPG, max 400KB each.</p>
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) acceptLogoFile(file);
            }}
            className={`mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-sm transition ${dragOver ? "border-[#0C6B4F] bg-[#0C6B4F]/5 text-[#0C6B4F]" : "border-stone-300 text-stone-500 hover:border-[#0C6B4F]/60 hover:text-[#0C6B4F]"}`}
          >
            <Upload className="h-6 w-6" />
            <span className="font-semibold">Drag &amp; drop a logo here, or click to upload</span>
            <span className="text-xs">PNG / JPG ≤ 400KB{uploading ? " — uploading…" : ""}</span>
          </button>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            aria-label="Upload logo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) acceptLogoFile(file);
              e.target.value = "";
            }}
          />
          {shownLogos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shownLogos.map((src, i) => (
                <div key={i} className="rounded-xl border border-[#E7E2D8] bg-white p-2">
                  <AssetImg src={src} publicId={shownPublicIds[src]} alt={`Logo ${i + 1}`} />
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setInvoice({ logoUrl: src }); setToast("Logo applied to invoice"); }}
                      className="flex-1 rounded-lg bg-[#0C6B4F] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#0a5a42]"
                    >
                      Use in invoice
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete logo ${i + 1}`}
                      onClick={() => removeLogo(i)}
                      className="rounded-lg border border-stone-200 px-2 py-1 text-stone-400 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-xs text-stone-400">
              <ImageIcon className="h-4 w-4" /> No logos yet.
            </p>
          )}
        </section>

        {/* Signatures */}
        <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)] sm:p-6">
          <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
            Signatures
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Draw below or upload an image (≤ 150KB).
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div>
              <canvas
                ref={canvasRef}
                width={330}
                height={330}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                aria-label="Draw signature"
                className="touch-none rounded-xl border border-[#E7E2D8] bg-white"
                style={{ width: 330, height: 330, maxWidth: "100%" }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="rounded-lg border border-[#E7E2D8] px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-red-300 hover:text-red-600"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C6B4F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0a5a42]"
                >
                  <PenLine className="h-3.5 w-3.5" /> Save signature
                </button>
                <button
                  type="button"
                  onClick={() => sigUploadRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E2D8] px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F]"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
                <input
                  ref={sigUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload signature"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) acceptSignatureFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              {shownSignatures.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {shownSignatures.map((src, i) => (
                    <div key={i} className="rounded-xl border border-[#E7E2D8] bg-white p-2">
                      <AssetImg src={src} publicId={shownPublicIds[src]} alt={`Signature ${i + 1}`} />
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setInvoice({ signatureUrl: src }); setToast("Signature applied to invoice"); }}
                          className="flex-1 rounded-lg bg-[#0C6B4F] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#0a5a42]"
                        >
                          Use in invoice
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete signature ${i + 1}`}
                          onClick={() => removeSignature(i)}
                          className="rounded-lg border border-stone-200 px-2 py-1 text-stone-400 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400">No signatures yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#141412] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
