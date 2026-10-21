"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickAvatar = (file: File) => {
    if (file.size > 1_000_000) {
      setError("ছবি সর্বোচ্চ ১ মেগাবাইট হতে পারবে");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(
      mode === "login" ? "/api/auth/login" : "/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { identifier, password }
            : { email, phone, nameEn, nameBn, password, avatar },
        ),
      },
    );
    setLoading(false);
    if (res.ok) {
      router.replace("/profile");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "ব্যর্থ হয়েছে, আবার চেষ্টা করুন");
    }
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  return (
    <div className="grid min-h-screen place-items-center bg-[#F8F9FA] px-4 py-10">
      <div className="anim-pop card w-full max-w-md rounded-xl p-8">
        <div className="text-center">
          <span className="mx-auto inline-block">
            <LogoMark size={48} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-[#1A1A1A]">
            {mode === "login" ? "অ্যাকাউন্টে লগইন" : "নতুন অ্যাকাউন্ট খুলুন"}
          </h1>
          <p className="mt-2 text-sm text-[#6C757D]">
            প্রোফাইলে স্কোর জমা থাকবে, প্রগ্রেস রিপোর্ট PDF-ও পাবেন
          </p>
        </div>

        {/* tabs */}
        <div className="mt-6 grid grid-cols-2 rounded-md border border-black/10 p-1 text-sm font-bold">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`rounded px-4 py-2.5 transition-colors ${
                mode === m
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#6C757D] hover:text-[#1A1A1A]"
              }`}
            >
              {m === "login" ? "লগইন" : "রেজিস্ট্রেশন"}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {mode === "login" ? (
            <div>
              <label className="text-sm font-medium text-slate-700">
                ইমেইল অথবা মোবাইল নম্বর
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@email.com / 01XXXXXXXXX"
                className={input}
              />
            </div>
          ) : (
            <>
              {/* avatar picker */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-[#F8F9FA] text-[#6C757D] transition-colors hover:border-[#E51A24]"
                >
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon name="users" size={26} />
                  )}
                </button>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    প্রোফাইল ছবি
                  </p>
                  <p className="text-xs text-[#6C757D]">
                    PC থেকে আপলোড করুন (jpg/png, ১MB)
                  </p>
                  {avatar && (
                    <button
                      onClick={() => setAvatar("")}
                      className="mt-1 text-xs font-semibold text-rose-600"
                    >
                      ছবি সরান
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) pickAvatar(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    নাম (বাংলা)
                  </label>
                  <input
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="রাহিম উদ্দিন"
                    className={input}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Name (English)
                  </label>
                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Rahim Uddin"
                    className={input}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  ইমেইল
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className={input}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  মোবাইল নম্বর
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={input}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="কমপক্ষে ৬ অক্ষর"
              className={input}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="btn-red w-full rounded-md py-3.5 font-bold disabled:opacity-60"
          >
            {loading
              ? "অপেক্ষা করুন…"
              : mode === "login"
                ? "লগইন করুন"
                : "অ্যাকাউন্ট খুলুন"}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-[#6C757D]">
          <Link href="/" className="transition-colors hover:text-[#1A1A1A]">
            মূল সাইটে ফিরে যান
          </Link>
        </p>
      </div>
    </div>
  );
}
