"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toBn } from "@/components/CountUp";
import Icon from "@/components/Icon";

type Q = {
  id: number;
  sectionId: number | null;
  qtype: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
  acceptedAnswers: string;
  explanation: string;
  sortOrder: number;
};

type Sec = {
  id: number;
  title: string;
  passageTitle: string;
  passageText: string;
  instruction: string;
  audioUrl: string;
  sortOrder: number;
};

type QPayload = Omit<Q, "id">;
type SecPayload = Omit<Sec, "id">;

type Op =
  | { kind: "create-q"; id: number; after: QPayload }
  | { kind: "edit-q"; id: number; before: QPayload; after: QPayload }
  | { kind: "delete-q"; id: number; before: QPayload }
  | { kind: "create-sec"; id: number; after: SecPayload }
  | { kind: "edit-sec"; id: number; before: SecPayload; after: SecPayload }
  | { kind: "delete-sec"; id: number; before: SecPayload; questions: QPayload[] };

const OPTION_LABELS = ["A", "B", "C", "D"];
const TFNG = ["TRUE", "FALSE", "NOT GIVEN"];
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

const emptyQ = {
  sectionId: 0,
  qtype: "mcq",
  text: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: 0,
  acceptedAnswers: "",
  explanation: "",
};

const emptySec = {
  title: "",
  passageTitle: "",
  passageText: "",
  instruction: "",
  audioUrl: "",
};

function qToPayload(q: Q): QPayload {
  const { id: _id, ...rest } = q;
  return rest;
}
function secToPayload(s: Sec): SecPayload {
  const { id: _id, ...rest } = s;
  return rest;
}

export default function QuestionManager({
  examId,
  module: examModule,
}: {
  examId: number;
  module: string;
}) {
  const [list, setList] = useState<Q[]>([]);
  const [secs, setSecs] = useState<Sec[]>([]);
  const [loading, setLoading] = useState(true);

  const [qForm, setQForm] = useState(emptyQ);
  const [editingQ, setEditingQ] = useState<number | null>(null);
  const [qOpen, setQOpen] = useState(false);

  const [secForm, setSecForm] = useState(emptySec);
  const [editingSec, setEditingSec] = useState<number | null>(null);
  const [secOpen, setSecOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ---- undo/redo history ----
  const [history, setHistory] = useState<Op[]>([]);
  const [cursor, setCursor] = useState(0); // ops [0, cursor) are applied
  const [busyHistory, setBusyHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const needsSections =
    examModule === "reading" ||
    examModule === "writing" ||
    examModule === "listening";
  const isWriting = examModule === "writing";

  const pushOp = (op: Op) => {
    setHistory((h) => [...h.slice(0, cursor), op]);
    setCursor((c) => c + 1);
  };

  const load = useCallback(async () => {
    const res = await fetch(`/api/exams/${examId}/questions?full=1`);
    const data = await res.json();
    setList(data.questions ?? []);
    setSecs(data.sections ?? []);
    setLoading(false);
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2600);
  };

  /* ---------- API helpers used by undo/redo ---------- */
  const apiCreateQ = async (payload: QPayload): Promise<number> => {
    const res = await fetch(`/api/exams/${examId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    return d.id;
  };
  const apiCreateSec = async (payload: SecPayload): Promise<number> => {
    const res = await fetch(`/api/exams/${examId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    return d.id;
  };

  const applyUndo = async (op: Op): Promise<Op> => {
    switch (op.kind) {
      case "create-q":
        await fetch(`/api/questions/${op.id}`, { method: "DELETE" });
        return op;
      case "edit-q":
        await fetch(`/api/questions/${op.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.before),
        });
        return op;
      case "delete-q": {
        const newId = await apiCreateQ(op.before);
        return { ...op, id: newId };
      }
      case "create-sec":
        await fetch(`/api/sections/${op.id}`, { method: "DELETE" });
        return op;
      case "edit-sec":
        await fetch(`/api/sections/${op.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.before),
        });
        return op;
      case "delete-sec": {
        const newId = await apiCreateSec(op.before);
        for (const qp of op.questions) {
          await apiCreateQ({ ...qp, sectionId: newId });
        }
        return { ...op, id: newId };
      }
    }
  };

  const applyRedo = async (op: Op): Promise<Op> => {
    switch (op.kind) {
      case "create-q": {
        const newId = await apiCreateQ(op.after);
        return { ...op, id: newId };
      }
      case "edit-q":
        await fetch(`/api/questions/${op.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.after),
        });
        return op;
      case "delete-q":
        await fetch(`/api/questions/${op.id}`, { method: "DELETE" });
        return op;
      case "create-sec": {
        const newId = await apiCreateSec(op.after);
        return { ...op, id: newId };
      }
      case "edit-sec":
        await fetch(`/api/sections/${op.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op.after),
        });
        return op;
      case "delete-sec":
        await fetch(`/api/sections/${op.id}`, { method: "DELETE" });
        return op;
    }
  };

  const undo = async () => {
    if (cursor === 0 || busyHistory) return;
    setBusyHistory(true);
    const op = history[cursor - 1];
    const updated = await applyUndo(op);
    setHistory((h) => h.map((o, i) => (i === cursor - 1 ? updated : o)));
    setCursor((c) => c - 1);
    await load();
    setBusyHistory(false);
    flash("পূর্বাবস্থায় ফেরানো হয়েছে");
  };

  const redo = async () => {
    if (cursor >= history.length || busyHistory) return;
    setBusyHistory(true);
    const op = history[cursor];
    const updated = await applyRedo(op);
    setHistory((h) => h.map((o, i) => (i === cursor ? updated : o)));
    setCursor((c) => c + 1);
    await load();
    setBusyHistory(false);
    flash("আবার প্রয়োগ করা হয়েছে");
  };

  /* ---------- audio upload ---------- */
  const uploadAudio = async (file: File) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(d.error || "আপলোড ব্যর্থ হয়েছে");
      return;
    }
    setSecForm((f) => ({ ...f, audioUrl: d.url }));
    flash("অডিও আপলোড সম্পন্ন");
  };

  /* ---------- section handlers ---------- */
  const saveSec = async () => {
    if (!secForm.title.trim()) {
      setError("অংশের শিরোনাম লিখুন (যেমন: Passage 1, Task 1, Section 1)");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      ...secForm,
      sortOrder: editingSec
        ? (secs.find((s) => s.id === editingSec)?.sortOrder ?? 0)
        : (secs[secs.length - 1]?.sortOrder ?? 0) + 1,
    };
    const res = await fetch(
      editingSec
        ? `/api/sections/${editingSec}`
        : `/api/exams/${examId}/sections`,
      {
        method: editingSec ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    const saved = await res.json();
    if (editingSec) {
      const before = secs.find((s) => s.id === editingSec);
      if (before) {
        pushOp({
          kind: "edit-sec",
          id: editingSec,
          before: secToPayload(before),
          after: payload,
        });
      }
    } else {
      pushOp({ kind: "create-sec", id: saved.id, after: payload });
    }
    setEditingSec(null);
    setSecForm(emptySec);
    setSecOpen(false);
    await load();
  };

  const removeSec = async (s: Sec) => {
    if (!confirm(`"${s.title}" মুছবেন? এর অধীন প্রশ্নও মুছে যাবে।`)) return;
    const ownQuestions = list
      .filter((q) => q.sectionId === s.id)
      .map(qToPayload);
    await fetch(`/api/sections/${s.id}`, { method: "DELETE" });
    pushOp({
      kind: "delete-sec",
      id: s.id,
      before: secToPayload(s),
      questions: ownQuestions,
    });
    await load();
    flash("মুছে ফেলা হয়েছে। ভুল হলে উপরের আনডু বোতাম ব্যবহার করুন।");
  };

  /* ---------- question handlers ---------- */
  const saveQ = async () => {
    if (!qForm.text.trim()) {
      setError("প্রশ্নটি লিখুন");
      return;
    }
    if ((qForm.qtype === "mcq" || qForm.qtype === "matching" || qForm.qtype === "dnd") && (!qForm.optionA.trim() || !qForm.optionB.trim())) {
      setError("MCQ-এর জন্য অন্তত A ও B অপশন দিন");
      return;
    }
    if ((qForm.qtype === "gap" || qForm.qtype === "dnd") && !qForm.acceptedAnswers.trim()) {
      setError("গ্রহণযোগ্য উত্তর দিন (একাধিক হলে | দিয়ে আলাদা করুন)");
      return;
    }
    if (needsSections && !qForm.sectionId) {
      setError("প্রশ্নটি কোন অংশের তা নির্বাচন করুন");
      return;
    }
    setSaving(true);
    setError("");
    const payload: QPayload = {
      ...qForm,
      sectionId: qForm.sectionId || null,
      sortOrder: editingQ
        ? (list.find((q) => q.id === editingQ)?.sortOrder ?? 0)
        : (list[list.length - 1]?.sortOrder ?? 0) + 1,
    };
    const res = await fetch(
      editingQ ? `/api/questions/${editingQ}` : `/api/exams/${examId}/questions`,
      {
        method: editingQ ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);
    if (!res.ok) {
      setError("সংরক্ষণ ব্যর্থ হয়েছে");
      return;
    }
    const saved = await res.json();
    if (editingQ) {
      const before = list.find((q) => q.id === editingQ);
      if (before) {
        pushOp({
          kind: "edit-q",
          id: editingQ,
          before: qToPayload(before),
          after: payload,
        });
      }
    } else {
      pushOp({ kind: "create-q", id: saved.id, after: payload });
    }
    setEditingQ(null);
    setQForm(emptyQ);
    await load();
  };

  const removeQ = async (q: Q) => {
    if (!confirm("এই প্রশ্নটি মুছে ফেলবেন?")) return;
    await fetch(`/api/questions/${q.id}`, { method: "DELETE" });
    pushOp({ kind: "delete-q", id: q.id, before: qToPayload(q) });
    if (editingQ === q.id) {
      setEditingQ(null);
      setQForm(emptyQ);
    }
    await load();
    flash("প্রশ্ন মুছে ফেলা হয়েছে। আনডু করতে উপরের বোতাম চাপুন।");
  };

  const input =
    "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#E51A24] focus:ring-2 focus:ring-red-100";

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card rounded-lg p-6">
            <div className="shimmer h-4 w-2/3 rounded" />
            <div className="shimmer mt-3 h-3 w-1/2 rounded" />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="shimmer h-9 rounded" />
              <div className="shimmer h-9 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ---- toolbar: undo / redo ---- */}
      <div className="card flex flex-wrap items-center justify-between gap-3 rounded-lg px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={cursor === 0 || busyHistory}
            className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-500 disabled:opacity-35"
          >
            <Icon name="undo" size={16} /> আনডু
          </button>
          <button
            onClick={redo}
            disabled={cursor >= history.length || busyHistory}
            className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-500 disabled:opacity-35"
          >
            <Icon name="redo" size={16} /> রিডু
          </button>
          <span className="ml-1 text-xs text-[#6C757D]">
            {toBn(cursor)}/{toBn(history.length)} পরিবর্তন
          </span>
        </div>
        {notice && (
          <span className="anim-fade-in text-sm font-semibold text-green-700">
            {notice}
          </span>
        )}
      </div>

      {/* ================= SECTIONS ================= */}
      {needsSections && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {isWriting
                ? "টাস্ক"
                : examModule === "listening"
                  ? "সেকশন ও অডিও"
                  : "প্যাসেজ"}{" "}
              ({toBn(secs.length)}টি)
            </h3>
            <button
              onClick={() => {
                setSecOpen((v) => !v);
                setEditingSec(null);
                setSecForm(emptySec);
                setError("");
              }}
              className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-200"
            >
              <Icon name={secOpen ? "x" : "plus"} size={15} />
              {secOpen ? "বন্ধ করুন" : isWriting ? "নতুন টাস্ক" : "নতুন অংশ"}
            </button>
          </div>

          {secOpen && (
            <div className="anim-fade-in card rounded-lg p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    অংশের নাম * (যেমন: {isWriting ? "Task 1" : examModule === "listening" ? "Section 1" : "Passage 1"})
                  </label>
                  <input
                    value={secForm.title}
                    onChange={(e) =>
                      setSecForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className={input}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    শিরোনাম
                  </label>
                  <input
                    value={secForm.passageTitle}
                    onChange={(e) =>
                      setSecForm((f) => ({ ...f, passageTitle: e.target.value }))
                    }
                    className={input}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    নির্দেশনা (প্রশ্নের উপরে দেখাবে)
                  </label>
                  <input
                    value={secForm.instruction}
                    onChange={(e) =>
                      setSecForm((f) => ({ ...f, instruction: e.target.value }))
                    }
                    placeholder="যেমন: Questions 1-5: Choose TRUE, FALSE or NOT GIVEN."
                    className={input}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    {isWriting
                      ? "টাস্কের বিবরণ *"
                      : examModule === "listening"
                        ? "ট্রান্সক্রিপ্ট / নোট (ঐচ্ছিক)"
                        : "প্যাসেজের মূল লেখা *"}
                  </label>
                  <textarea
                    value={secForm.passageText}
                    onChange={(e) =>
                      setSecForm((f) => ({ ...f, passageText: e.target.value }))
                    }
                    rows={isWriting ? 4 : 8}
                    className={input}
                  />
                </div>

                {/* audio upload from PC */}
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    অডিও ফাইল (PC থেকে আপলোড, mp3/wav/ogg/m4a, সর্বোচ্চ ১৫MB)
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadAudio(f);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-500 disabled:opacity-50"
                    >
                      <Icon name="audio" size={16} />
                      {uploading ? "আপলোড হচ্ছে…" : "অডিও বেছে নিন"}
                    </button>
                    {secForm.audioUrl && (
                      <>
                        <audio
                          controls
                          src={secForm.audioUrl}
                          className="h-10 max-w-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSecForm((f) => ({ ...f, audioUrl: "" }))
                          }
                          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                        >
                          <Icon name="trash" size={14} /> সরান
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
              <button
                onClick={saveSec}
                disabled={saving}
                className="btn-red mt-5 rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {saving ? "সংরক্ষণ হচ্ছে…" : editingSec ? "আপডেট করুন" : "যোগ করুন"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {secs.map((s) => (
              <div key={s.id} className="card rounded-lg px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {s.title}
                      {s.passageTitle && (
                        <span className="ml-2 font-normal text-[#6C757D]">
                          · {s.passageTitle}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#6C757D]">
                      {toBn(list.filter((q) => q.sectionId === s.id).length)}টি
                      প্রশ্ন
                      {s.audioUrl && " · অডিও যুক্ত"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSec(s.id);
                        setSecForm({
                          title: s.title,
                          passageTitle: s.passageTitle,
                          passageText: s.passageText,
                          instruction: s.instruction,
                          audioUrl: s.audioUrl,
                        });
                        setSecOpen(true);
                        setError("");
                      }}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-200"
                    >
                      <Icon name="edit" size={14} /> সম্পাদনা
                    </button>
                    <button
                      onClick={() => removeSec(s)}
                      className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      <Icon name="trash" size={14} /> মুছুন
                    </button>
                  </div>
                </div>
                {s.audioUrl && (
                  <audio controls src={s.audioUrl} className="mt-3 h-10 w-full max-w-md" />
                )}
              </div>
            ))}
            {secs.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-[#6C757D]">
                {isWriting
                  ? "এখনও কোনো টাস্ক নেই। উপরে থেকে টাস্ক যোগ করুন।"
                  : "এখনও কোনো অংশ নেই। আগে অংশ যোগ করুন, তারপর প্রশ্ন।"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ================= QUESTIONS ================= */}
      {!isWriting && (
        <div className="space-y-4">
          <div className="card rounded-lg">
            <button
              onClick={() => {
                setQOpen((v) => !v);
                if (qOpen) {
                  setEditingQ(null);
                  setQForm(emptyQ);
                }
                setError("");
              }}
              className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold"
            >
              <span className="flex items-center gap-2.5">
                <Icon name={editingQ ? "edit" : "plus"} size={17} className="text-[#E51A24]" />
                {editingQ
                  ? `প্রশ্ন #${toBn(editingQ)} সম্পাদনা`
                  : "নতুন প্রশ্ন যোগ করুন"}
              </span>
              <Icon
                name="plus"
                size={16}
                className={`text-[#6C757D] ${qOpen ? "rotate-45" : ""}`}
              />
            </button>

            {qOpen && (
              <div className="anim-fade-in border-t border-black/[0.06] px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      প্রশ্নের ধরন
                    </label>
                    <select
                      value={qForm.qtype}
                      onChange={(e) =>
                        setQForm((f) => ({ ...f, qtype: e.target.value }))
                      }
                      className={input}
                    >
                      <option value="mcq">MCQ (A/B/C/D)</option>
                      <option value="matching">Matching Headings</option>
                      <option value="dnd">Drag-and-Drop Ordering</option>
                      <option value="essay">Essay Writing</option>
                      <option value="tfng">TRUE / FALSE / NOT GIVEN</option>
                      <option value="gap">ফাঁকা পূরণ (টাইপ করা উত্তর)</option>
                    </select>
                  </div>
                  {needsSections && (
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        কোন অংশের প্রশ্ন *
                      </label>
                      <select
                        value={qForm.sectionId}
                        onChange={(e) =>
                          setQForm((f) => ({
                            ...f,
                            sectionId: Number(e.target.value),
                          }))
                        }
                        className={input}
                      >
                        <option value={0}>নির্বাচন করুন</option>
                        {secs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  প্রশ্ন *
                </label>
                <textarea
                  value={qForm.text}
                  onChange={(e) =>
                    setQForm((f) => ({ ...f, text: e.target.value }))
                  }
                  rows={2}
                  className={input}
                />

                {(qForm.qtype === "mcq" || qForm.qtype === "matching" || qForm.qtype === "dnd") && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {OPTION_KEYS.map((key, i) => (
                      <div key={key}>
                        <label className="flex items-center justify-between text-sm font-medium text-slate-700">
                          অপশন {OPTION_LABELS[i]}
                          <button
                            type="button"
                            onClick={() =>
                              setQForm((f) => ({ ...f, correctOption: i }))
                            }
                            className={`rounded-md px-3 py-0.5 text-xs font-semibold transition-colors ${
                              qForm.correctOption === i
                                ? "bg-green-600 text-white"
                                : "bg-slate-100 text-[#6C757D] hover:bg-slate-200"
                            }`}
                          >
                            {qForm.correctOption === i
                              ? "সঠিক উত্তর"
                              : "সঠিক ধরুন"}
                          </button>
                        </label>
                        <input
                          value={qForm[key]}
                          onChange={(e) =>
                            setQForm((f) => ({ ...f, [key]: e.target.value }))
                          }
                          className={input}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {qForm.qtype === "tfng" && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      সঠিক উত্তর
                    </label>
                    <div className="mt-2 flex gap-2">
                      {TFNG.map((t, i) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setQForm((f) => ({ ...f, correctOption: i }))
                          }
                          className={`rounded-md px-4 py-2.5 text-sm font-bold transition-colors ${
                            qForm.correctOption === i
                              ? "bg-[#1A1A1A] text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(qForm.qtype === "gap" || qForm.qtype === "dnd") && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      {qForm.qtype === "dnd" ? "সঠিক ক্রম (যেমন: 0,1,2,3)" : "গ্রহণযোগ্য উত্তর * (একাধিক হলে | দিয়ে আলাদা করুন)"}
                    </label>
                    <input
                      value={qForm.acceptedAnswers}
                      onChange={(e) =>
                        setQForm((f) => ({
                          ...f,
                          acceptedAnswers: e.target.value,
                        }))
                      }
                      placeholder="যেমন: colour|color"
                      className={input}
                    />
                  </div>
                )}

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  ব্যাখ্যা (ঐচ্ছিক)
                </label>
                <textarea
                  value={qForm.explanation}
                  onChange={(e) =>
                    setQForm((f) => ({ ...f, explanation: e.target.value }))
                  }
                  rows={2}
                  className={input}
                />
                {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={saveQ}
                    disabled={saving}
                    className="btn-red rounded-md px-6 py-2.5 text-sm font-bold disabled:opacity-60"
                  >
                    {saving
                      ? "সংরক্ষণ হচ্ছে…"
                      : editingQ
                        ? "আপডেট করুন"
                        : "প্রশ্ন যোগ করুন"}
                  </button>
                  {editingQ && (
                    <button
                      onClick={() => {
                        setEditingQ(null);
                        setQForm(emptyQ);
                      }}
                      className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      বাতিল
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-[#6C757D]">
            মোট প্রশ্ন: {toBn(list.length)}টি
          </p>
          {list.map((q, idx) => {
            const sec = secs.find((s) => s.id === q.sectionId);
            return (
              <div key={q.id} className="card rounded-lg p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold leading-relaxed">
                    {toBn(idx + 1)}. {q.text}
                    <span className="ml-2 rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-normal text-[#6C757D]">
                      {q.qtype === "gap"
                        ? "ফাঁকা পূরণ"
                        : q.qtype === "tfng"
                          ? "T/F/NG"
                          : q.qtype === "dnd"
                            ? "Drag-Drop"
                            : q.qtype === "matching"
                              ? "Matching"
                              : q.qtype === "essay"
                                ? "Essay"
                                : "MCQ"}
                      {sec ? ` · ${sec.title}` : ""}
                    </span>
                  </h3>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setEditingQ(q.id);
                        setQForm({
                          sectionId: q.sectionId ?? 0,
                          qtype: q.qtype,
                          text: q.text,
                          optionA: q.optionA,
                          optionB: q.optionB,
                          optionC: q.optionC,
                          optionD: q.optionD,
                          correctOption: q.correctOption,
                          acceptedAnswers: q.acceptedAnswers,
                          explanation: q.explanation,
                        });
                        setQOpen(true);
                        setError("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-200"
                    >
                      <Icon name="edit" size={14} /> সম্পাদনা
                    </button>
                    <button
                      onClick={() => removeQ(q)}
                      className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      <Icon name="trash" size={14} /> মুছুন
                    </button>
                  </div>
                </div>

                {(q.qtype === "gap" || q.qtype === "dnd") ? (
                  <p className="mt-3 text-sm font-medium text-green-700">
                    গ্রহণযোগ্য উত্তর: {q.acceptedAnswers.split("|").join(" / ")}
                  </p>
                ) : q.qtype === "tfng" ? (
                  <p className="mt-3 text-sm font-medium text-green-700">
                    সঠিক: {TFNG[q.correctOption]}
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {[q.optionA, q.optionB, q.optionC, q.optionD]
                      .filter((o) => o !== "")
                      .map((o, i) => (
                        <div
                          key={i}
                          className={`rounded-md border px-3 py-2 ${
                            i === q.correctOption
                              ? "border-green-300 bg-green-50 text-green-800"
                              : "border-black/[0.07] text-[#6C757D]"
                          }`}
                        >
                          {OPTION_LABELS[i]}. {o}
                        </div>
                      ))}
                  </div>
                )}
                {q.explanation && (
                  <p className="mt-3 text-xs text-[#6C757D]">
                    ব্যাখ্যা: {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 py-14 text-center text-sm text-[#6C757D]">
              এখনও কোনো প্রশ্ন নেই। উপরের ফর্ম থেকে প্রশ্ন যোগ করুন।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
