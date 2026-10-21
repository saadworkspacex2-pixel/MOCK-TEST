"use client";

import { useRef, useState } from "react";

type ExamLite = { id: number; title: string };
type ExportQuestion = {
  qtype: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
  acceptedAnswers: string;
  explanation: string;
};
type ExportPayload = {
  exam: { title: string };
  questions: ExportQuestion[];
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

function csvCell(s: string | number): string {
  return `"${String(s).replace(/"/g, '""')}"`;
}

export default function BulkTools({ exams, onDone }: { exams: ExamLite[]; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [exportId, setExportId] = useState("");
  const jsonRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const importJson = async (file: File) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = JSON.parse(await file.text()) as unknown;
      const res = await fetch("/api/exams/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = (await res.json()) as { id?: number; questions?: number; error?: string };
      if (!res.ok) throw new Error(d.error || "ইমপোর্ট ব্যর্থ");
      setMessage(`ইমপোর্ট সম্পন্ন: exam #${d.id}, ${d.questions}টি প্রশ্ন`);
      onDone();
    } catch (e) { setError(e instanceof Error ? e.message : "ইমপোর্ট ব্যর্থ"); }
    setBusy(false);
  };

  // CSV headers: exam_title,section_title,qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation
  const importCsv = async (file: File) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const rows = parseCsv(await file.text());
      const headers = rows[0].map((h) => h.trim());
      let imported = 0;
      const groups = new Map<string, string[][]>();
      for (const r of rows.slice(1)) {
        const obj = Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""]));
        const title = obj.exam_title || "Imported Exam";
        if (!groups.has(title)) groups.set(title, []);
        groups.get(title)?.push(r);
      }
      for (const [title, groupRows] of groups) {
        const sectionNames = Array.from(new Set(groupRows.map((r) => r[headers.indexOf("section_title")] || "")));
        const payload = {
          exam: { title, module: sectionNames.some(Boolean) ? "reading" : "mcq", category: "Imported" },
          sections: sectionNames.filter(Boolean).map((name, i) => ({ key: i + 1, title: name, passageTitle: name, passageText: "" })),
          questions: groupRows.map((r, i) => {
            const obj = Object.fromEntries(headers.map((h, idx) => [h, r[idx] ?? ""]));
            const secIndex = sectionNames.indexOf(obj.section_title || "");
            return {
              sectionKey: secIndex >= 0 && obj.section_title ? secIndex + 1 : null,
              qtype: obj.qtype || "mcq",
              text: obj.text,
              optionA: obj.option_a || "",
              optionB: obj.option_b || "",
              optionC: obj.option_c || "",
              optionD: obj.option_d || "",
              correctOption: Number(obj.correct_option || 0),
              acceptedAnswers: obj.accepted_answers || "",
              explanation: obj.explanation || "",
              sortOrder: i,
            };
          }),
        };
        const res = await fetch("/api/exams/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`${title} ইমপোর্ট ব্যর্থ`);
        imported++;
      }
      setMessage(`${imported}টি পরীক্ষা CSV থেকে ইমপোর্ট হয়েছে`);
      onDone();
    } catch (e) { setError(e instanceof Error ? e.message : "CSV ইমপোর্ট ব্যর্থ"); }
    setBusy(false);
  };

  const download = async (format: "json" | "csv") => {
    if (!exportId) { setError("একটি পরীক্ষা বেছে নিন"); return; }
    setBusy(true); setError("");
    const res = await fetch(`/api/exams/${exportId}/export`);
    const data = (await res.json()) as ExportPayload;
    setBusy(false);
    if (!res.ok) { setError("এক্সপোর্ট ব্যর্থ"); return; }
    let blob: Blob;
    if (format === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    } else {
      const header = "qtype,text,option_a,option_b,option_c,option_d,correct_option,accepted_answers,explanation";
      const lines = data.questions.map((q) => [q.qtype, q.text, q.optionA, q.optionB, q.optionC, q.optionD, q.correctOption, q.acceptedAnswers, q.explanation].map(csvCell).join(","));
      blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${data.exam.title.replace(/\s+/g, "-")}.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="card rounded-lg p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold">Bulk Import / Export</span>
        <button onClick={() => jsonRef.current?.click()} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-bold">JSON ইমপোর্ট</button>
        <button onClick={() => csvRef.current?.click()} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-bold">CSV ইমপোর্ট</button>
        <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ""; }} />
        <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ""; }} />
        <select value={exportId} onChange={(e) => setExportId(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-xs">
          <option value="">এক্সপোর্টের পরীক্ষা…</option>
          {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <button onClick={() => download("json")} disabled={busy} className="rounded-md bg-slate-100 px-4 py-2 text-xs font-bold">JSON</button>
        <button onClick={() => download("csv")} disabled={busy} className="rounded-md bg-slate-100 px-4 py-2 text-xs font-bold">CSV</button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
