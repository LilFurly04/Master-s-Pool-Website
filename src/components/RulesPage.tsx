export default function RulesPage({ settings }: { settings: { cutPenalty: number; countingGolfers: number; name: string } }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-masters-cream border border-masters-gold/30 rounded-xl p-6">
        <h2 className="font-serif text-2xl font-bold text-masters-green mb-1">{settings.name} — Rules</h2>
        <p className="text-gray-500 text-sm">Augusta National Golf Club · April 9–12, 2026</p>
      </div>

      {/* How to play */}
      <Section title="🏌️ How to Play" color="green">
        <p>Each participant picks <strong>6 golfers</strong> from the Masters field before the first tee time on Thursday morning. Golfers are divided into <strong>4 tiers</strong> based on FanDuel betting odds, and you must pick from each tier as follows:</p>
        <TierTable />
        <p className="mt-3">No golfer may appear in more than one slot. You can change your picks any time before the deadline.</p>
      </Section>

      {/* Scoring */}
      <Section title="📊 Scoring" color="gold">
        <ul className="space-y-3">
          <li>
            <strong>Best {settings.countingGolfers} of 6 scores count.</strong> Your worst single score is automatically dropped.
          </li>
          <li>
            <strong>Scores are relative to par</strong> (–10 = 10-under, E = even, +2 = 2-over). Your pool total is the sum of your {settings.countingGolfers} counting golfers' final scores.
          </li>
          <li>
            <strong>Lowest total wins.</strong> In the event of a tie, participants share the position (T2, T3, etc.).
          </li>
        </ul>
      </Section>

      {/* Missed cut rule */}
      <Section title="✂️ Missed Cut Rule" color="red">
        <p>The Masters cut is made after 36 holes (Rounds 1–2). Approximately the top 50 players and ties advance to Rounds 3–4.</p>
        <ul className="space-y-2 mt-3">
          <li>
            If one of your golfers <strong>misses the cut</strong>, their effective score is their 36-hole total plus a penalty of{" "}
            <strong>+{settings.cutPenalty} strokes for each remaining round</strong> (2 rounds = +{settings.cutPenalty * 2} total penalty).
          </li>
          <li>
            Example: A golfer finishes at <strong>+4</strong> after 2 rounds and misses the cut → their counted score is{" "}
            <strong>+{4 + settings.cutPenalty * 2}</strong>.
          </li>
          <li>
            Because only <strong>{settings.countingGolfers} of 6</strong> scores count, one missed cut is automatically dropped if it is your worst score. Having two or more golfers miss the cut significantly hurts your chances.
          </li>
        </ul>
      </Section>

      {/* Tiers explained */}
      <Section title="🏷️ Tier System" color="blue">
        <p>Tiers are set based on <strong>FanDuel Sportsbook outright odds</strong> prior to the tournament. Lower odds = higher favorites = Tier 1.</p>
        <div className="mt-3 space-y-2">
          {[
            { tier: 1, label: "Elite Favorites", odds: "+350 – +1600", picks: 2, color: "bg-yellow-100 border-yellow-300" },
            { tier: 2, label: "Contenders", odds: "+2000 – +4000", picks: 2, color: "bg-blue-100 border-blue-300" },
            { tier: 3, label: "Dark Horses", odds: "+4500 – +9000", picks: 1, color: "bg-green-100 border-green-300" },
            { tier: 4, label: "Longshots", odds: "+10000+", picks: 1, color: "bg-gray-100 border-gray-300" },
          ].map((t) => (
            <div key={t.tier} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${t.color}`}>
              <div>
                <span className="font-semibold">Tier {t.tier} — {t.label}</span>
                <span className="text-sm text-gray-600 ml-2">({t.odds})</span>
              </div>
              <span className="text-sm font-semibold">Pick {t.picks}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          The tier system ensures a balanced lineup — everyone must have some elite favorites and some longshots, preventing one participant from simply picking all the top-6 favorites.
        </p>
      </Section>

      {/* Probability / prediction feature */}
      <Section title="📈 Probability & Predictions" color="purple">
        <p>The <strong>Pool Standings</strong> tab shows live probability estimates for each participant:</p>
        <ul className="space-y-2 mt-3">
          <li>
            <strong>Pool Win%</strong> — estimated probability of winning the pool.
            <ul className="mt-1 ml-4 space-y-1 text-sm text-gray-600">
              <li>• <em>Pre-tournament:</em> based on lineup strength derived from each golfer's outright odds.</li>
              <li>• <em>During tournament:</em> updates dynamically based on current scores and a model of remaining-round variance (~3.5 strokes/round std dev).</li>
            </ul>
          </li>
          <li><strong>Pool Top 3%</strong> / <strong>Top 5%</strong> — same model applied to finishing top 3 or top 5 in the pool standings.</li>
          <li><strong>Golfer Win%</strong> — probability that at least one of your 6 golfers wins the Masters tournament.</li>
        </ul>
        <p className="text-sm text-gray-500 mt-3">
          Probability figures are estimates based on pre-tournament odds and a simplified model — they are for entertainment and informational purposes and do not represent guaranteed outcomes.
          Strokes-gained stats are sourced from DataGolf approximations.
        </p>
      </Section>

      {/* Pick deadline */}
      <Section title="⏰ Pick Deadline" color="orange">
        <p>
          All picks must be submitted before the first tee time on <strong>Thursday, April 9, 2026 at 8:00 AM ET</strong>.
          Picks are automatically locked at the deadline. The admin may also lock picks manually at any time.
        </p>
        <p className="mt-2">After the deadline, picks are read-only and the pool standings begin updating with live scores.</p>
      </Section>

      {/* Golfer hover cards */}
      <Section title="📋 Golfer Info Cards" color="gray">
        <p>
          On the <strong>Make Picks</strong> page, hover over any golfer to see an info card containing:
        </p>
        <ul className="space-y-1 mt-2 text-sm text-gray-600 list-disc list-inside">
          <li>FanDuel outright odds + win/top-5/top-10 probabilities</li>
          <li>All-time Masters finishes (most recent first)</li>
          <li>Recent tournament results (last 5 events)</li>
          <li>Season strokes-gained stats (Total, Off the Tee, Approach, Around the Green, Putting)</li>
        </ul>
        <p className="mt-2 text-sm text-gray-500">Use the <strong>Show/Hide Stats</strong> toggle to simplify the picker if you prefer a cleaner view.</p>
      </Section>

      <div className="text-center text-xs text-gray-400 pb-4 font-serif italic">
        Good luck — may your golfers find Amen Corner kind 🌿
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: "green" | "gold" | "red" | "blue" | "purple" | "orange" | "gray";
}) {
  const border = {
    green: "border-masters-green/30",
    gold: "border-masters-gold/40",
    red: "border-red-200",
    blue: "border-blue-200",
    purple: "border-purple-200",
    orange: "border-orange-200",
    gray: "border-gray-200",
  }[color];

  const heading = {
    green: "text-masters-green",
    gold: "text-masters-gold-dark",
    red: "text-red-700",
    blue: "text-blue-700",
    purple: "text-purple-700",
    orange: "text-orange-700",
    gray: "text-gray-700",
  }[color];

  return (
    <div className={`bg-white border ${border} rounded-xl p-6 space-y-3`}>
      <h3 className={`font-serif font-bold text-lg ${heading}`}>{title}</h3>
      <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function TierTable() {
  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-masters-green text-white">
          <tr>
            <th className="text-left px-4 py-2 font-semibold">Tier</th>
            <th className="text-left px-4 py-2 font-semibold">Odds Range</th>
            <th className="text-center px-4 py-2 font-semibold">Picks Required</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            { tier: 1, label: "Elite Favorites", odds: "+350 – +1600", picks: 2 },
            { tier: 2, label: "Contenders", odds: "+2000 – +4000", picks: 2 },
            { tier: 3, label: "Dark Horses", odds: "+4500 – +9000", picks: 1 },
            { tier: 4, label: "Longshots", odds: "+10000+", picks: 1 },
          ].map((row) => (
            <tr key={row.tier} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium">Tier {row.tier} — {row.label}</td>
              <td className="px-4 py-2 text-gray-500 font-mono">{row.odds}</td>
              <td className="px-4 py-2 text-center font-bold text-masters-green">{row.picks}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-semibold">
            <td className="px-4 py-2">Total</td>
            <td className="px-4 py-2" />
            <td className="px-4 py-2 text-center text-masters-green">6</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
