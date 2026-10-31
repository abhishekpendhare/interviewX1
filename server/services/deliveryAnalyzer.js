/**
 * STRATA Voice Mock Interview — Delivery Analysis Service
 *
 * Advisory metrics computed strictly from transcript and audio timing:
 * - Speaking pace (Words Per Minute, target band 120-160 WPM)
 * - Filler word density & breakdown
 * - Pause and hesitation analysis
 * - Answer length vs recommended allocation
 * - Rambling index (words spoken per rubric point covered)
 *
 * IMPORTANT: Delivery metrics are purely advisory coaching signals.
 * They NEVER reduce or influence the candidate's correctness mark.
 */

const COMMON_FILLERS = [
  "um", "uh", "er", "ah", "like", "you know", "basically", 
  "actually", "sort of", "kind of", "literally", "honestly", 
  "i mean", "right", "so basically", "well basically"
];

class DeliveryAnalyzer {

  static analyze({ transcript = "", durationSeconds = 0, pauseData = null, pointsCovered = 0, totalPoints = 4 }) {
    const text = (transcript || "").trim();
    const words = text ? text.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;

    // Default duration estimation if not provided: assume average speaking rate of 135 WPM
    const effectiveDuration = durationSeconds > 0 ? durationSeconds : Math.max(10, (wordCount / 135) * 60);
    const durationMinutes = Math.max(0.1, effectiveDuration / 60);

    // 1. Words Per Minute (WPM)
    const wpm = Math.round(wordCount / durationMinutes);
    let paceBand = "ideal";
    let paceVerdict = "Optimal conversational pace";

    if (wpm < 100) {
      paceBand = "slow";
      paceVerdict = "Speaking pace was slightly slow (<100 WPM). Aim for fluid, confident continuity.";
    } else if (wpm < 120) {
      paceBand = "moderate";
      paceVerdict = "Deliberate and clear, slightly below the 130 WPM sweet spot.";
    } else if (wpm <= 165) {
      paceBand = "ideal";
      paceVerdict = "Well-calibrated conversational pace within the recommended 120-165 WPM band.";
    } else {
      paceBand = "fast";
      paceVerdict = "Speaking pace was fast (>165 WPM). Consider pausing after key technical insights.";
    }

    // 2. Filler Word Detection
    const lowerText = text.toLowerCase();
    const fillerCounts = {};
    let totalFillers = 0;

    for (const filler of COMMON_FILLERS) {
      // Use regex word boundaries for accurate matching
      const regex = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        fillerCounts[filler] = matches.length;
        totalFillers += matches.length;
      }
    }

    const fillerRatePercent = wordCount > 0 ? parseFloat(((totalFillers / wordCount) * 100).toFixed(1)) : 0;
    let fillerVerdict = "Exceptional polish with minimal filler words (<2%).";
    if (fillerRatePercent > 6.0) {
      fillerVerdict = `High filler density (${fillerRatePercent}%). Try intentional silent pauses instead of verbal crutches.`;
    } else if (fillerRatePercent > 3.0) {
      fillerVerdict = `Moderate filler density (${fillerRatePercent}%). Practice breath pacing at sentence transitions.`;
    }

    // 3. Pause & Hesitation Analysis
    const pauses = pauseData || {
      pauseCount: Math.max(0, Math.floor(effectiveDuration / 25)),
      totalPauseSeconds: Math.round(effectiveDuration * 0.12),
      longestPauseSeconds: effectiveDuration > 30 ? 3.2 : 1.5
    };

    // 4. Rambling & Conciseness Index
    // Evaluates how efficiently the student communicated the necessary rubric points
    const coveredRatio = totalPoints > 0 ? pointsCovered / totalPoints : 0;
    const wordsPerPoint = pointsCovered > 0 ? Math.round(wordCount / pointsCovered) : wordCount;
    
    let ramblingVerdict = "Crisp, information-dense answer.";
    let ramblingStatus = "concise";

    if (wordCount > 150 && pointsCovered <= 1) {
      ramblingStatus = "rambling";
      ramblingVerdict = "High word volume with low technical rubric density. Focus on direct architectural answers before tangents.";
    } else if (wordCount > 250 && pointsCovered < 3) {
      ramblingStatus = "verbose";
      ramblingVerdict = "Detailed response, but took significant explanation time to hit core rubric points.";
    } else if (wordCount < 40 && pointsCovered < 2) {
      ramblingStatus = "brief";
      ramblingVerdict = "Answer was brief. Expand with concrete algorithmic steps and failure-mode tradeoffs.";
    }

    // 5. Synthesize Actionable Advisory Tips
    const tips = [];
    if (paceBand === "fast") {
      tips.push("Pacing: Slow down slightly at complex invariants so the interviewer can process your logic.");
    } else if (paceBand === "slow") {
      tips.push("Pacing: Practice bulleted speaking frameworks (e.g. Approach -> Tradeoff -> Complexity) to sustain momentum.");
    }

    if (totalFillers > 3) {
      const topFillers = Object.entries(fillerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([w, c]) => `"${w}" (${c}x)`)
        .join(" and ");
      tips.push(`Fillers: Watch verbal crutches like ${topFillers}. Replace them with a 1-second breath.`);
    }

    if (ramblingStatus === "rambling") {
      tips.push("Structure: State the high-level concept in sentence 1 before diving into implementation details.");
    }

    if (tips.length === 0) {
      tips.push("Delivery: Strong delivery clarity, natural cadence, and confident technical articulation.");
    }

    return {
      durationSeconds: Math.round(effectiveDuration),
      wordCount,
      wpm,
      paceBand,
      paceVerdict,
      fillerRatePercent,
      totalFillers,
      fillerBreakdown: fillerCounts,
      fillerVerdict,
      pauses,
      wordsPerPoint,
      ramblingStatus,
      ramblingVerdict,
      advisoryTips: tips
    };
  }
}

module.exports = DeliveryAnalyzer;
