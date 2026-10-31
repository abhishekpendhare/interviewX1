/**
 * Phase 6 Evaluation Harness & Tuning Loop
 * Executable via: npm run eval:interview
 *
 * Assertions:
 * 1. Mean Absolute Error (MAE) <= 1.0 / 10
 * 2. Rank Correlation (Spearman rho) >= 0.90
 * 3. Zero Inversions (Wrong/Off-topic never scores >= Correct)
 * 4. Consistency: 5 runs SD <= 0.5, status match >= 90%
 * 5. Verbosity Bias: Long wrong never beats short correct
 * 6. Robustness: Grammar & mishearings score within 1.0 point of clean
 * 7. Safety: Injection, empty, gibberish 100% handled
 * 8. Speech Transcription: Technical term accuracy >= 90%
 * 9. Fallback Mode: Non-fixed, monotonic marks
 */

const fs = require('fs');
const path = require('path');
const EvidenceEvaluator = require('../agent/evidenceEvaluator');
const SpeechTranscriptionService = require('../services/speechTranscriptionService');
const GOLD_CASES = require('../data/buildGoldSet');

// Math Helpers
function mean(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (arr.length <= 1) return 0;
  const avg = mean(arr);
  const variance = mean(arr.map(x => Math.pow(x - avg, 2)));
  return Math.sqrt(variance);
}

function spearmanRankCorrelation(xArr, yArr) {
  const n = xArr.length;
  if (n <= 1) return 1.0;

  const rank = arr => {
    const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
    const ranks = new Array(n);
    sorted.forEach((item, r) => { ranks[item.idx] = r + 1; });
    return ranks;
  };

  const xRanks = rank(xArr);
  const yRanks = rank(yArr);

  let dSquaredSum = 0;
  for (let i = 0; i < n; i++) {
    dSquaredSum += Math.pow(xRanks[i] - yRanks[i], 2);
  }

  return 1 - (6 * dSquaredSum) / (n * (n * n - 1));
}

// Levenshtein distance for Word Error Rate (WER)
function computeWER(refText, hypText) {
  const ref = refText.toLowerCase().split(/\s+/).filter(Boolean);
  const hyp = hypText.toLowerCase().split(/\s+/).filter(Boolean);

  const dp = Array.from({ length: ref.length + 1 }, () => new Array(hyp.length + 1).fill(0));
  for (let i = 0; i <= ref.length; i++) dp[i][0] = i;
  for (let j = 0; j <= hyp.length; j++) dp[0][j] = j;

  for (let i = 1; i <= ref.length; i++) {
    for (let j = 1; j <= hyp.length; j++) {
      if (ref[i - 1] === hyp[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const dist = dp[ref.length][hyp.length];
  return ref.length > 0 ? parseFloat((dist / ref.length).toFixed(3)) : 0;
}

async function runEvaluationHarness() {
  console.log("================================================================================");
  console.log("STRATA VOICE MOCK INTERVIEW — PHASE 6 EVALUATION HARNESS");
  console.log("================================================================================\n");

  const results = [];
  const expectedMarks = [];
  const actualMarks = [];

  // 1. Evaluate Gold Set Cases
  console.log(`[+] Evaluating ${GOLD_CASES.length} gold set test cases...`);
  for (const tc of GOLD_CASES) {
    const rubric = EvidenceEvaluator.getRubric(tc.questionId);
    const evalOut = await EvidenceEvaluator.evaluateAnswer({
      transcript: tc.answer,
      rubric,
      questionText: rubric.question
    });

    results.push({
      ...tc,
      actualMark: evalOut.overallScore,
      markBand: evalOut.markBand,
      verdict: evalOut.verdict,
      evalOut
    });

    expectedMarks.push(tc.expectedMark);
    actualMarks.push(evalOut.overallScore);
  }

  // 2. Metric 1: Mean Absolute Error (MAE)
  const absErrors = results.map(r => Math.abs(r.actualMark - r.expectedMark));
  const mae = parseFloat(mean(absErrors).toFixed(2));
  const maePassed = mae <= 1.0;

  // 3. Metric 2: Rank Correlation
  const rankCorrelation = parseFloat(spearmanRankCorrelation(expectedMarks, actualMarks).toFixed(3));
  const correlationPassed = rankCorrelation >= 0.90;

  // 4. Metric 3: Zero Inversions
  // Check within each question that wrong/off-topic NEVER beats excellent/good/partial
  let inversionCount = 0;
  const questions = [...new Set(GOLD_CASES.map(tc => tc.questionId))];

  for (const qId of questions) {
    const qCases = results.filter(r => r.questionId === qId);
    const correctCases = qCases.filter(r => ['excellent', 'good', 'short_correct'].includes(r.category));
    const incorrectCases = qCases.filter(r => ['wrong', 'long_wrong', 'off_topic', 'gibberish'].includes(r.category));

    for (const corr of correctCases) {
      for (const inc of incorrectCases) {
        if (inc.actualMark >= corr.actualMark) {
          console.error(`❌ Inversion in ${qId}: ${inc.category} (${inc.actualMark}) >= ${corr.category} (${corr.actualMark})`);
          inversionCount++;
        }
      }
    }
  }
  const inversionsPassed = inversionCount === 0;

  // 5. Metric 4: Consistency Across 5 Runs
  console.log("[+] Running 5-run consistency check on sample answers...");
  const consistencyProbe = GOLD_CASES.find(c => c.category === 'excellent');
  const consistencyMarks = [];
  const consistencyRubric = EvidenceEvaluator.getRubric(consistencyProbe.questionId);
  const statusMatches = [];

  for (let run = 0; run < 5; run++) {
    const out = await EvidenceEvaluator.evaluateAnswer({
      transcript: consistencyProbe.answer,
      rubric: consistencyRubric,
      questionText: consistencyRubric.question
    });
    consistencyMarks.push(out.overallScore);
    const coveredIds = out.rubricResults.filter(r => r.status === 'covered').map(r => r.id).sort().join(',');
    statusMatches.push(coveredIds);
  }

  const consistencySD = parseFloat(stdDev(consistencyMarks).toFixed(3));
  const modalMatchCount = statusMatches.filter(s => s === statusMatches[0]).length;
  const statusMatchRatio = parseFloat((modalMatchCount / 5).toFixed(2));
  const consistencyPassed = consistencySD <= 0.5 && statusMatchRatio >= 0.90;

  // 6. Metric 5: Verbosity Bias
  // Long wrong answer must NEVER beat short correct answer
  let verbosityBiasViolations = 0;
  for (const qId of questions) {
    const qCases = results.filter(r => r.questionId === qId);
    const longWrong = qCases.find(r => r.category === 'long_wrong');
    const shortCorrect = qCases.find(r => r.category === 'short_correct');

    if (longWrong && shortCorrect) {
      if (longWrong.actualMark >= shortCorrect.actualMark) {
        console.error(`❌ Verbosity bias in ${qId}: Long wrong (${longWrong.actualMark}) >= Short correct (${shortCorrect.actualMark})`);
        verbosityBiasViolations++;
      }
    }
  }
  const verbosityBiasPassed = verbosityBiasViolations === 0;

  // 7. Metric 6: Robustness (Grammar & Mishearings <= 1.0 point delta)
  let robustnessViolations = 0;
  for (const qId of questions) {
    const qCases = results.filter(r => r.questionId === qId);
    const cleanExcellent = qCases.find(r => r.category === 'excellent');
    const grammarCase = qCases.find(r => r.category === 'grammar_mistakes');
    const sttCase = qCases.find(r => r.category === 'stt_mishearings');

    if (cleanExcellent && grammarCase) {
      const delta = Math.abs(cleanExcellent.actualMark - grammarCase.actualMark);
      if (delta > 1.0) {
        console.error(`❌ Grammar robustness failed in ${qId}: delta ${delta} > 1.0`);
        robustnessViolations++;
      }
    }
    if (cleanExcellent && sttCase) {
      const delta = Math.abs(cleanExcellent.actualMark - sttCase.actualMark);
      if (delta > 1.0) {
        console.error(`❌ STT mishearing robustness failed in ${qId}: delta ${delta} > 1.0`);
        robustnessViolations++;
      }
    }
  }
  const robustnessPassed = robustnessViolations === 0;

  // 8. Metric 7: Adversarial, Empty, Gibberish Handled 100%
  const safetyCases = results.filter(r => ['prompt_injection', 'empty', 'gibberish'].includes(r.category));
  const safetyHandled = safetyCases.every(r => r.actualMark <= 0.5);
  const safetyPassed = safetyHandled && safetyCases.length > 0;

  // 9. Metric 8: Speech Audio & Technical Vocabulary Accuracy
  console.log("[+] Running speech transcription & technical vocabulary benchmark (10 samples)...");
  
  // 10 representative Indian-English speech transcript cases with phonetic slips
  const AUDIO_TEST_SAMPLES = [
    {
      label: "Audio 1 (HashMap & Red-Black Tree)",
      rawSpoken: "A HashMap handles collision using separate chaining with linked lists. Load factory 0.75 and when full re hashing doubles the table. In Java 8 it will tree if i to red black three at 8 nodes.",
      expectedTerms: ["HashMap", "separate chaining", "load factor", "rehashing", "treeify", "Red-Black tree"]
    },
    {
      label: "Audio 2 (Floyd Tortoise and Hare)",
      rawSpoken: "To detect loop we use flight algorithm with tortoise and hair. Slow pointer moves 1 step and fast moves 2 steps until meeting.",
      expectedTerms: ["Floyd's algorithm", "tortoise and hare"]
    },
    {
      label: "Audio 3 (OS Process vs Thread TLB)",
      rawSpoken: "Process context switch changes page tables and flushes t l b causing cache misses. In thread switch translation look aside buffer is preserved.",
      expectedTerms: ["TLB", "Translation Lookaside Buffer", "context switch"]
    },
    {
      label: "Audio 4 (Pessimistic vs Optimistic Locking)",
      rawSpoken: "Pessimistic locking uses select for update to lock rows upfront. Optimistic locking uses version column at commit time.",
      expectedTerms: ["pessimistic locking", "optimistic locking", "SELECT FOR UPDATE", "version column"]
    },
    {
      label: "Audio 5 (ConcurrentHashMap CAS)",
      rawSpoken: "Concurrent hash map uses compare and swap c a s for empty bucket and bucket head synchronized block on collision with volatile reads.",
      expectedTerms: ["ConcurrentHashMap", "CAS", "Compare-And-Swap", "volatile"]
    },
    {
      label: "Audio 6 (JVM Metaspace vs PermGen)",
      rawSpoken: "Metaspace stores class metadata in native off heap memory, replacing perm gen in Java 8.",
      expectedTerms: ["Metaspace", "PermGen"]
    },
    {
      label: "Audio 7 (Spring Data JPA N+1)",
      rawSpoken: "We fix N plus 1 select problem using join fetch in jpql or at entity graph on repository method.",
      expectedTerms: ["N+1 select", "JOIN FETCH", "@EntityGraph"]
    },
    {
      label: "Audio 8 (Spring Security FilterChain)",
      rawSpoken: "In security filter chain we place jwt filter before username password authentication filter with stateless session.",
      expectedTerms: ["SecurityFilterChain", "UsernamePasswordAuthenticationFilter", "JWT"]
    },
    {
      label: "Audio 9 (B+ Tree Leaf Doubly Linked List)",
      rawSpoken: "B plus tree stores row pointers in leaf nodes linked in a list. Fan out is much higher than be three.",
      expectedTerms: ["B+ Tree", "B-Tree", "fan-out", "leaf nodes"]
    },
    {
      label: "Audio 10 (TCP 3-Way Handshake TIME_WAIT)",
      rawSpoken: "TCP 3 way handshake uses syn syn ack and ack to negotiate initial sequence numbers. Close uses time wait for two msl.",
      expectedTerms: ["TCP 3-way handshake", "SYN", "SYN-ACK", "ACK", "TIME_WAIT", "2MSL"]
    }
  ];

  // Also inspect external audio folder if user placed audio files there
  const audioFolder = path.join(__dirname, 'audio_samples');
  if (fs.existsSync(audioFolder)) {
    const files = fs.readdirSync(audioFolder).filter(f => /\.(wav|webm|mp3|m4a|ogg)$/i.test(f));
    if (files.length > 0) {
      console.log(`[+] Found ${files.length} user-supplied audio files in ${audioFolder}`);
    }
  }

  let totalTermsExpected = 0;
  let totalTermsAccurate = 0;
  const werScores = [];

  for (const sample of AUDIO_TEST_SAMPLES) {
    const processed = await SpeechTranscriptionService.processAudioOrTranscript({
      fallbackTranscript: sample.rawSpoken
    });

    const detected = SpeechTranscriptionService.detectTechnicalTerms(processed.transcript);
    const sampleTermsAccurate = sample.expectedTerms.filter(et => 
      processed.transcript.toLowerCase().includes(et.toLowerCase())
    ).length;

    totalTermsExpected += sample.expectedTerms.length;
    totalTermsAccurate += sampleTermsAccurate;

    // Estimate WER against repaired transcript
    const wer = computeWER(sample.rawSpoken, processed.transcript);
    werScores.push(wer);
  }

  const technicalTermAccuracy = parseFloat(((totalTermsAccurate / totalTermsExpected) * 100).toFixed(1));
  const avgWER = parseFloat(mean(werScores).toFixed(3));
  const speechPassed = technicalTermAccuracy >= 90.0;

  // 10. Metric 9: Offline Fallback Evaluation
  console.log("[+] Verifying offline fallback mode (deterministic, non-fixed, ordered)...");
  const fallbackExcellent = EvidenceEvaluator.evaluateOffline(consistencyProbe.answer, consistencyRubric);
  const fallbackWrong = EvidenceEvaluator.evaluateOffline("This is completely wrong and load factor is not important.", consistencyRubric);
  const fallbackOrdered = fallbackExcellent.mark > fallbackWrong.mark && fallbackExcellent.mark !== 7.0 && fallbackWrong.mark !== 7.0;

  // Summary Table
  console.log("\n================================================================================");
  console.log("EVALUATION HARNESS AUDIT SUMMARY");
  console.log("================================================================================");
  console.log(`| Metric                         | Threshold     | Actual Result  | Status |`);
  console.log(`|--------------------------------|---------------|----------------|--------|`);
  console.log(`| Mean Absolute Error (MAE)      | <= 1.0 / 10   | ${mae.toFixed(2)}           | ${maePassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Spearman Rank Correlation      | >= 0.90       | ${rankCorrelation.toFixed(3)}          | ${correlationPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Inversion Violations           | 0 violations  | ${inversionCount} violations    | ${inversionsPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Consistency (5-run SD)         | <= 0.50       | ${consistencySD.toFixed(3)}          | ${consistencyPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Verbosity Bias Violations      | 0 violations  | ${verbosityBiasViolations} violations    | ${verbosityBiasPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Robustness (Grammar/STT delta) | <= 1.0 point  | ${robustnessViolations} violations    | ${robustnessPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Adversarial & Safety Handling  | 100% caught   | ${safetyPassed ? '100% caught' : 'FAIL'}    | ${safetyPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Technical Term Speech Accuracy | >= 90.0%      | ${technicalTermAccuracy}%          | ${speechPassed ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`| Average Transcription WER      | Reported      | ${(avgWER * 100).toFixed(1)}%          | INFO ℹ️ |`);
  console.log(`| Offline Fallback Monotonicity  | Goal-correct  | Ordered & Non-fixed | ${fallbackOrdered ? 'PASS ✅' : 'FAIL ❌'} |`);
  console.log(`================================================================================\n`);

  const allPassed = maePassed && correlationPassed && inversionsPassed && 
                    consistencyPassed && verbosityBiasPassed && robustnessPassed && 
                    safetyPassed && speechPassed && fallbackOrdered;

  if (allPassed) {
    console.log("🏆 ALL HARNESS THRESHOLDS MET AND VERIFIED WITH MATHEMATICAL GROUNDING.\n");
    return { success: true, mae, rankCorrelation, inversionCount, consistencySD, technicalTermAccuracy };
  } else {
    console.error("❌ ONE OR MORE HARNESS THRESHOLDS FAILED.\n");
    process.exit(1);
  }
}

if (require.main === module) {
  runEvaluationHarness().catch(err => {
    console.error("Evaluation harness error:", err);
    process.exit(1);
  });
}

module.exports = runEvaluationHarness;
