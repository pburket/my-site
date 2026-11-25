import { ComingSoon } from "@/components/ComingSoon";
import { loadLatest } from "@/lib/capstone-store";
import { simulateAll } from "@/lib/capstone-simulate";
import type { CapstoneProbe, CapstoneAnswer } from "@/lib/capstone-helpers";

export const metadata = { title: "Capstone Decision Report" };

// Freshness contract: re-render on every request so the report matches the
// latest saved answer (and the 10,000 simulated results for that problem).
export const dynamic = "force-dynamic";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function pct(chance: number): string {
  // One decimal when needed, e.g. 7.3% — matches how the grader reads it.
  const v = Math.round(chance * 1000) / 10;
  return Number.isInteger(v) ? `${v}%` : `${v}%`;
}

export default async function CapstonePage() {
  const latest = await loadLatest();

  if (!latest) {
    return (
      <ComingSoon
        lane={5}
        title="Capstone: Live Decision Service"
        description="A full advocacy report on a decision domain I choose (staffing, inventory, pricing, or channels). Built after Lane 5."
      />
    );
  }

  const { probe, answer } = latest;
  const results = simulateAll(probe);
  if (!results) {
    return (
      <ComingSoon
        lane={5}
        title="Capstone: Live Decision Service"
        description="Simulation is not ready yet — finish simulateRun() first."
      />
    );
  }

  const reader = String(probe.scenario.params.reader ?? "the reader");
  const unit = String(probe.scenario.params.unit ?? "result");
  const periodName = String(probe.scenario.params.periodName ?? "period");
  const chosen = probe.candidates.find((c) => c.id === answer.action) ?? probe.candidates[0];
  const other = probe.candidates.find((c) => c.id !== chosen.id) ?? probe.candidates[1];
  const thinNode = probe.dag.nodes
    .filter((n) => typeof n.basedOn === "number")
    .sort((a, b) => (a.basedOn ?? 0) - (b.basedOn ?? 0))[0];

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        Lane 5 · capstone decision report
      </p>
      <h1 className="mt-3 text-4xl font-bold">
        Which shop should {reader} work at next {periodName}?
      </h1>
      {/* TODO(yours): one sentence on what this report is for. */}
      <p className="mt-4 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
        Patrick needs to decide which shop to work at next quarter to ensure that a minimum of 3,750 cars are fixed.
      </p>

      {/* ── Situation ───────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">The situation</h2>
        <p className="mt-2 max-w-prose text-muted">{probe.scenario.narrative}</p>
        <p className="mt-3 max-w-prose text-muted">{probe.limit.plain}</p>
        {/* TODO(yours): how you will choose, in your words. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          The decision rule will run the recipe 10,000 times and show the likely range of results for each shop.  The rule will tell us the likelihood of each shop falling below the minimum of 3,750 cars fixed as well as visual representation of each shop's projected performance.  Finally the rule will make a recommendation based on those simulations.
        </p>
      </section>

      {/* ── Recommendation ──────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">The recommendation</h2>
        <p className="mt-3 text-lg" data-capstone="recommendation">
          Patrick should work from Shop 1 next quarter.
        </p>
        {/* TODO(yours): why this option, in plain words. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          Shop 1 falls short in only 2% of runs, while Shop 2 falls short in 14% of runs.  Shop 1 offers a much more stable floor than Shop 2.
        </p>
        {/* Graded number hooks — small print for the grader; sentences above are yours. */}
        <p className="mt-4 text-xs tabular-nums text-muted">
          option <span data-capstone="action">{answer.action}</span>
          {" · "}
          typical{" "}
          <span data-capstone="typical-result">
            {fmt(answer.outcomes[answer.action].typical)}
          </span>{" "}
          {unit}
          {" · "}
          falls short{" "}
          <span data-capstone="chance-short">
            {Math.round(answer.outcomes[answer.action].chanceShort * 100)} in 100
          </span>
        </p>
      </section>

      {/* ── Both options ────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">Both options side by side</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {probe.candidates.map((c) => {
            const o = answer.outcomes[c.id];
            const isChosen = c.id === answer.action;
            return (
              <div
                key={c.id}
                className={`rounded-lg border p-4 ${isChosen ? "border-accent bg-surface" : "border-line"}`}
              >
                <p className={`text-lg font-bold ${isChosen ? "text-accent" : ""}`}>
                  {c.label}
                  {isChosen ? " (recommended)" : ""}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>
                    Typical: <span className="font-semibold text-ink tabular-nums">{fmt(o.typical)}</span> {unit}
                  </li>
                  <li>
                    Likely range:{" "}
                    <span className="font-semibold text-ink tabular-nums">
                      {fmt(o.low)} – {fmt(o.high)}
                    </span>
                  </li>
                  <li>
                    Falls short:{" "}
                    <span className="font-semibold text-ink tabular-nums">{pct(o.chanceShort)}</span> of
                    runs
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
        {/* TODO(yours): what a manager should notice in the comparison. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          Shop 1 has a lower typical cars fixed than Shop 2 as well as a lower ceiling of the likely range.  However, Shop 1 has a higher floor of the likely range and much more reliably achieves the target of 3,750 cars fixed. 
        </p>
      </section>

      {/* ── History chart ───────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">What the history shows</h2>
        <div
          data-capstone="all-data-chart"
          data-points={probe.history.length}
          className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface p-4"
        >
          <HistoryChart probe={probe} />
        </div>
        {/* TODO(yours): what the dots say, in your words. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          History shows a higher floor and ceiling of the likely range for Shop 1 with and without Patrick there.  More data is needed to reliably determine Patrick's effect on Shop 2, as Patrick only visited Shop 2 three times in the history.
        </p>
      </section>

      {/* ── Outcome chart (both options, 10,000 runs) ───────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">
          10,000 possible next {periodName}s — both options
        </h2>
        <div
          data-capstone="outcome-chart"
          className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface p-4"
        >
          <OutcomeChart probe={probe} answer={answer} results={results} />
        </div>
        {/* TODO(yours): how to read the overlapping distributions. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          Shop 1 shows a much more likely possibility of achieving the target of 3,750 cars fixed than Shop 2, though Shop 2 shows a higher typical result and higher maximum result.

        </p>
      </section>

      {/* ── DAG / recipe ────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">The recipe behind the numbers</h2>
        <div
          data-capstone="dag"
          data-nodes={probe.dag.nodes.length}
          className="mt-4 rounded-lg border border-line bg-surface p-4"
        >
          <DagFigure probe={probe} />
        </div>
        {/* TODO(yours): connect the picture to the decision. */}
        <p className="mt-3 max-w-prose border border-dashed border-line bg-surface/50 p-3 text-sm text-muted">
          The two decisions in nodes 9 and 10 encompass the total production of both shops depending on whether Patrick chooses to work from Shop 1 or Shop 2.  The production from both shops is much more predictably above the necessary limit in if Patrick chooses Shop 1.
        </p>
      </section>

      {/* ── Uncertainty ─────────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold">How sure can {reader} be?</h2>
        <p className="mt-3 max-w-prose text-muted" data-capstone="uncertainty">
         Patrick can have high confidence in his decision for Shop 1 as Shop 1 has a likely range of 3,781-4,074 cars fixed.  Shop 2 has a higher typical results 
         and higher ceiling, but with a lower floor with a likely range of 3,630-4,298 cars fixed.  That makes Shop 2 fall beneath the target of 3,750 cars fixed more frequently than Shop 1.  Additionally, there are only three instances of Patrick working at Shop 2 in the history.  More evidence would make that clearer. </p>
      </section>
    </main>
  );
}

/* ─── Charts (plain SVG only) ─────────────────────────────────────────── */

function HistoryChart({ probe }: { probe: CapstoneProbe }) {
  // Staffing history: group by shop × whether Patrick was there.
  const groups = [
    { key: "1-1", label: "Shop 1 · Patrick there", shop: 1, patrick: 1, color: "#1d4ed8" },
    { key: "1-0", label: "Shop 1 · without Patrick", shop: 1, patrick: 0, color: "#93c5fd" },
    { key: "2-1", label: "Shop 2 · Patrick there", shop: 2, patrick: 1, color: "#b45309" },
    { key: "2-0", label: "Shop 2 · without Patrick", shop: 2, patrick: 0, color: "#fbbf24" },
  ];

  const unit = String(probe.scenario.params.unit ?? "cars");
  const values = probe.history.map((r) => Number(r.cars));
  const minY = Math.min(...values) - 2;
  const maxY = Math.max(...values) + 2;

  const w = 640;
  const h = 280;
  const pad = { l: 36, r: 16, t: 20, b: 56 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const colW = innerW / groups.length;
  const y = (v: number) => pad.t + ((maxY - v) / (maxY - minY || 1)) * innerH;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label="Every past day as a dot, grouped by shop and whether Patrick was there"
    >
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h - pad.b} stroke="currentColor" opacity={0.25} />
      <line x1={pad.l} y1={h - pad.b} x2={w - pad.r} y2={h - pad.b} stroke="currentColor" opacity={0.25} />
      <text x={4} y={pad.t + 4} className="fill-current text-[10px]" opacity={0.6}>
        {Math.round(maxY)}
      </text>
      <text x={4} y={h - pad.b} className="fill-current text-[10px]" opacity={0.6}>
        {Math.round(minY)}
      </text>

      {groups.map((g, gi) => {
        const rows = probe.history.filter(
          (r) => Number(r.shop) === g.shop && Number(r.patrick) === g.patrick
        );
        const cx0 = pad.l + gi * colW + colW / 2;
        return (
          <g key={g.key}>
            <line
              x1={pad.l + gi * colW}
              y1={pad.t}
              x2={pad.l + gi * colW}
              y2={h - pad.b}
              stroke="currentColor"
              opacity={0.08}
            />
            {rows.map((r, i) => {
              // Jitter within the group column so overlapping days stay visible.
              const jitter = ((i % 7) - 3) * 3.2;
              return (
                <circle
                  key={`${g.key}-${i}`}
                  cx={cx0 + jitter}
                  cy={y(Number(r.cars))}
                  r={4}
                  fill={g.color}
                  opacity={0.85}
                >
                  <title>
                    {g.label}: {r.cars} {unit}
                  </title>
                </circle>
              );
            })}
            <text
              x={cx0}
              y={h - 28}
              textAnchor="middle"
              className="fill-current text-[10px]"
              opacity={0.8}
            >
              {g.label.split(" · ")[0]}
            </text>
            <text
              x={cx0}
              y={h - 14}
              textAnchor="middle"
              className="fill-current text-[10px]"
              opacity={0.65}
            >
              {g.label.split(" · ")[1]} ({rows.length})
            </text>
          </g>
        );
      })}

      <text x={pad.l} y={h - 2} className="fill-current text-[11px]" opacity={0.7}>
        One dot per past day · grouped by shop and whether Patrick was there · {unit}
      </text>
    </svg>
  );
}

function OutcomeChart({
  probe,
  answer,
  results,
}: {
  probe: CapstoneProbe;
  answer: CapstoneAnswer;
  results: Record<string, number[]>;
}) {
  const [a, b] = probe.candidates;
  const unit = String(probe.scenario.params.unit ?? "result");
  const all = [...results[a.id], ...results[b.id], probe.limit.atLeast];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const bins = 40;
  const binW = (max - min) / bins || 1;
  const countsA = new Array(bins).fill(0);
  const countsB = new Array(bins).fill(0);
  for (const v of results[a.id]) countsA[Math.min(bins - 1, Math.floor((v - min) / binW))]++;
  for (const v of results[b.id]) countsB[Math.min(bins - 1, Math.floor((v - min) / binW))]++;
  // Same vertical scale for both panels so spread is comparable.
  const peak = Math.max(...countsA, ...countsB, 1);

  const w = 640;
  const panelH = 110;
  const gap = 28;
  const pad = { l: 44, r: 20, t: 28, b: 40 };
  const h = pad.t + panelH + gap + panelH + pad.b;
  const innerW = w - pad.l - pad.r;
  const barW = innerW / bins;
  const limitX = pad.l + ((probe.limit.atLeast - min) / (max - min || 1)) * innerW;
  const limitLabel = `${fmt(probe.limit.atLeast)} ${unit}`;

  function panel(
    label: string,
    counts: number[],
    color: string,
    top: number,
    typical: number
  ) {
    const baseline = top + panelH;
    const typX = pad.l + ((typical - min) / (max - min || 1)) * innerW;
    return (
      <g>
        <text x={pad.l} y={top - 6} className="fill-current text-[12px] font-semibold">
          {label}
        </text>
        <line x1={pad.l} y1={baseline} x2={w - pad.r} y2={baseline} stroke="currentColor" opacity={0.2} />
        {counts.map((c, i) => {
          const bh = (c / peak) * (panelH - 8);
          return (
            <rect
              key={`${label}-${i}`}
              x={pad.l + i * barW}
              y={baseline - bh}
              width={Math.max(barW - 0.5, 1)}
              height={bh}
              fill={color}
              opacity={0.75}
            />
          );
        })}
        {/* Typical-result tick on this panel's scale */}
        <line x1={typX} y1={baseline - 6} x2={typX} y2={baseline + 6} stroke={color} strokeWidth={2} />
      </g>
    );
  }

  const topA = pad.t;
  const topB = pad.t + panelH + gap;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Two histograms of 10,000 results for ${a.label} and ${b.label} on the same scale`}
    >
      {panel(a.label, countsA, "#1d4ed8", topA, answer.outcomes[a.id].typical)}
      {panel(b.label, countsB, "#b45309", topB, answer.outcomes[b.id].typical)}

      {/* Shared falling-short limit across both histograms */}
      <line
        x1={limitX}
        y1={topA - 4}
        x2={limitX}
        y2={topB + panelH}
        stroke="#dc2626"
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      <text
        x={Math.min(limitX + 6, w - pad.r - 120)}
        y={pad.t - 12}
        className="fill-red-700 text-[11px] font-medium"
      >
        {limitLabel}
      </text>

      <text x={pad.l} y={h - 18} className="fill-current text-[10px]" opacity={0.65}>
        {fmt(min)}
      </text>
      <text x={w - pad.r - 48} y={h - 18} className="fill-current text-[10px]" opacity={0.65}>
        {fmt(max)}
      </text>
      <text x={pad.l} y={h - 4} className="fill-current text-[11px]" opacity={0.75}>
        Same horizontal scale · dashed line = need at least {limitLabel} · short ticks = typical result
      </text>
    </svg>
  );
}

/** Short plain-word names for DAG boxes — edit these, not the ids. */
const DAG_SHORT_NAMES: Record<string, string> = {
  "avg-shop-1-with": "Shop 1 avg with Patrick",
  "avg-shop-2-without": "Shop 2 avg without Patrick",
  "avg-shop-2-with": "Shop 2 avg with Patrick",
  "avg-shop-1-without": "Shop 1 avg without Patrick",
  "cars-shop-1-with": "Shop 1 day with Patrick",
  "cars-shop-2-without": "Shop 2 day without Patrick",
  "cars-shop-2-with": "Shop 2 day with Patrick",
  "cars-shop-1-without": "Shop 1 day without Patrick",
  "total-shop-1": "Quarter total · work at Shop 1",
  "total-shop-2": "Quarter total · work at Shop 2",
};

/** Left→right order per row so feeders sit above results and arrows do not cross. */
const DAG_ROW_ORDER: Record<"once" | "daily" | "result", string[]> = {
  once: ["avg-shop-1-with", "avg-shop-2-without", "avg-shop-2-with", "avg-shop-1-without"],
  daily: ["cars-shop-1-with", "cars-shop-2-without", "cars-shop-2-with", "cars-shop-1-without"],
  result: ["total-shop-1", "total-shop-2"],
};

function DagFigure({ probe }: { probe: CapstoneProbe }) {
  const byId = new Map(probe.dag.nodes.map((n) => [n.id, n]));

  // Number boxes left→right, top→bottom (once, then daily/weekly, then result).
  const orderedIds = [
    ...DAG_ROW_ORDER.once,
    ...DAG_ROW_ORDER.daily,
    ...DAG_ROW_ORDER.result,
  ].filter((id) => byId.has(id));
  // Any unexpected nodes still appear at the end of their repeat row.
  for (const n of probe.dag.nodes) {
    if (!orderedIds.includes(n.id)) orderedIds.push(n.id);
  }
  const numberOf = new Map(orderedIds.map((id, i) => [id, i + 1]));

  const boxW = 150;
  const boxH = 52;
  const gapX = 18;
  const rowGap = 56;
  const padX = 12;
  const padY = 16;
  const cols = 4;
  const w = padX * 2 + cols * boxW + (cols - 1) * gapX;
  const h = padY * 2 + 3 * boxH + 2 * rowGap;

  function rowY(row: 0 | 1 | 2) {
    return padY + row * (boxH + rowGap);
  }

  function positionsFor(ids: string[], row: 0 | 1 | 2): Map<string, { x: number; y: number; cx: number; cy: number }> {
    const map = new Map<string, { x: number; y: number; cx: number; cy: number }>();
    const n = ids.length;
    // Spread across the full width so each result sits under its feeders.
    ids.forEach((id, i) => {
      const slot = n === 1 ? 1.5 : n === 2 ? (i === 0 ? 0.5 : 2.5) : i;
      const x = padX + slot * (boxW + gapX);
      const y = rowY(row);
      map.set(id, { x, y, cx: x + boxW / 2, cy: y + boxH / 2 });
    });
    return map;
  }

  const onceIds = DAG_ROW_ORDER.once.filter((id) => byId.has(id));
  const midIds = [
    ...DAG_ROW_ORDER.daily,
    ...probe.dag.nodes.filter((n) => n.repeat === "weekly").map((n) => n.id),
  ].filter((id, i, arr) => byId.has(id) && arr.indexOf(id) === i);
  const resultIds = DAG_ROW_ORDER.result.filter((id) => byId.has(id));

  const pos = new Map([
    ...positionsFor(onceIds, 0),
    ...positionsFor(midIds, 1),
    ...positionsFor(resultIds, 2),
  ]);

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        className="h-auto"
        role="img"
        aria-label="Recipe diagram: shop averages feed daily cars, which feed each option's quarter total"
      >
        <defs>
          <marker
            id="capstone-dag-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" opacity={0.55} />
          </marker>
        </defs>

        {probe.dag.edges.map(([from, to], i) => {
          const a = pos.get(from);
          const b = pos.get(to);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.cx}
              y1={a.y + boxH}
              x2={b.cx}
              y2={b.y}
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.45}
              markerEnd="url(#capstone-dag-arrow)"
            />
          );
        })}

        {orderedIds.map((id) => {
          const n = byId.get(id);
          const p = pos.get(id);
          if (!n || !p) return null;
          const num = numberOf.get(id) ?? 0;
          const name = DAG_SHORT_NAMES[id] ?? shortLabel(n.plain);
          const fill =
            n.repeat === "result" ? "#dbeafe" : n.repeat === "once" ? "#f8fafc" : "#fff7ed";
          // Two-line wrap for the short name inside the box.
          const mid = name.length > 18 ? name.lastIndexOf(" ", 18) : -1;
          const line1 = mid > 0 ? name.slice(0, mid) : name;
          const line2 = mid > 0 ? name.slice(mid + 1) : "";
          return (
            <g key={id}>
              <rect
                x={p.x}
                y={p.y}
                width={boxW}
                height={boxH}
                rx={8}
                fill={fill}
                stroke="currentColor"
                strokeOpacity={0.35}
              />
              <text x={p.x + 8} y={p.y + 16} className="fill-current text-[11px] font-bold">
                {num}
              </text>
              <text x={p.x + 8} y={p.y + (line2 ? 32 : 36)} className="fill-current text-[10px]">
                {line1}
              </text>
              {line2 ? (
                <text x={p.x + 8} y={p.y + 44} className="fill-current text-[10px]">
                  {line2}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
        {orderedIds.map((id) => {
          const n = byId.get(id);
          if (!n) return null;
          return (
            <li key={id} value={numberOf.get(id)} className="leading-snug text-ink">
              {n.plain}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function shortLabel(plain: string): string {
  const first = plain.split(/[.;]/)[0]?.trim() ?? plain;
  return first.length > 36 ? `${first.slice(0, 34)}…` : first;
}
