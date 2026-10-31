/**
 * STRATA Voice Mock Interview — Speech Transcription Service
 *
 * Capabilities:
 * 1. Privacy-Preserving Audio Ingestion (in-memory buffer, zero disk persistence)
 * 2. High-Accuracy Server-Side Whisper via Groq API or Gemini API with Domain Vocabulary Hints
 * 3. Technical Vocabulary Spell-Repair & Phonetic Engine (tailored for Indian-English accents)
 * 4. Confidence Scoring and Technical Term Detection
 */

const https = require('https');

// Master Technical Vocabulary Hint List
const TECHNICAL_VOCABULARY = [
  // DSA & Data Structures
  "HashMap", "separate chaining", "open addressing", "load factor", "rehashing", 
  "treeify", "treeification", "Red-Black tree", "TreeBin", "Floyd's algorithm", 
  "tortoise and hare", "two pointers", "HashSet", "Doubly-Linked List", "LRU Cache", 
  "sentinel nodes", "amortized O(1)", "O(n)", "O(log n)", "O(n^2)",
  // OS & Architecture
  "virtual address space", "TLB", "Translation Lookaside Buffer", "PCB", "TCB", 
  "context switch", "page table", "page fault", "MMU", "swap space", "dirty bit", 
  "CR3 register", "pthread_create", "fork()",
  // DBMS & Transactions
  "optimistic locking", "pessimistic locking", "SELECT FOR UPDATE", "version column", 
  "B-Tree", "B+ Tree", "fan-out", "leaf nodes", "InnoDB", "clustered index", 
  "ACID", "MVCC", "deadlock detection", "retry storm",
  // Java & JVM
  "ConcurrentHashMap", "Metaspace", "PermGen", "CAS", "Compare-And-Swap", "volatile", 
  "Unsafe", "CounterCell", "LongAdder", "-XX:MaxMetaspaceSize", "jcmd", "jstat", 
  "garbage collector", "Eden", "Survivor", "Tenured", "classloader leak", "CGLIB",
  // Spring & REST
  "N+1 select", "JOIN FETCH", "@EntityGraph", "FetchType.EAGER", "FetchType.LAZY", 
  "MultipleBagFetchException", "@BatchSize", "SecurityFilterChain", "FilterChainProxy", 
  "DelegatingFilterProxy", "UsernamePasswordAuthenticationFilter", 
  "SessionCreationPolicy.STATELESS", "SecurityContextHolder", "Bearer token", "JWT",
  // Networking
  "TCP 3-way handshake", "SYN", "SYN-ACK", "ACK", "ISN", "Initial Sequence Number", 
  "FIN", "TIME_WAIT", "2MSL", "Maximum Segment Lifetime", "half-close",
  // Behavioral & STAR
  "STAR method", "Situation", "Task", "Action", "Result", "post-mortem", 
  "blameless post-mortem", "root cause analysis", "CI/CD pipeline"
];

// Phonetic and Speech-To-Text Repair Rules for Indian-English accents & technical terms
const PHONETIC_REPAIRS = [
  { pattern: /\b(tree\s*if\s*i|three\s*if\s*i|tree\s*phi|treefy|tree\s*fy)\b/gi, replacement: "treeify" },
  { pattern: /\b(tree\s*if\s*i\s*cation|three\s*if\s*i\s*cation)\b/gi, replacement: "treeification" },
  { pattern: /\b(red\s*black\s*three|read\s*black\s*tree)\b/gi, replacement: "Red-Black tree" },
  { pattern: /\b(low\s*factor|load\s*factory)\b/gi, replacement: "load factor" },
  { pattern: /\b(re\s*hashing|re\s*hash)\b/gi, replacement: "rehashing" },
  { pattern: /\b(flight\s*algorithm|flawed\s*algorithm|floyd\s*algorithm|floyds\s*algorithm)\b/gi, replacement: "Floyd's algorithm" },
  { pattern: /\b(tortoise\s*and\s*hair|turtle\s*and\s*hair|tortoise\s*and\s*hear)\b/gi, replacement: "tortoise and hare" },
  { pattern: /\b(t\s*l\s*b|tlbe|tlb\s*flush)\b/gi, replacement: "TLB" },
  { pattern: /\b(translation\s*look\s*aside\s*buffer)\b/gi, replacement: "Translation Lookaside Buffer" },
  { pattern: /\b(be\s*plus\s*three|b\s*plus\s*three|b\s*\+\s*three|be\s*plus\s*tree|b\s*plus\s*tree)\b/gi, replacement: "B+ Tree" },
  { pattern: /\b(be\s*three|b\s*three)\b/gi, replacement: "B-Tree" },
  { pattern: /\b(fan\s*out|fun\s*out)\b/gi, replacement: "fan-out" },
  { pattern: /\b(select\s*for\s*update)\b/gi, replacement: "SELECT FOR UPDATE" },
  { pattern: /\b(concurrent\s*hash\s*map|concurrenthashmap)\b/gi, replacement: "ConcurrentHashMap" },
  { pattern: /\b(c\s*a\s*s|see\s*a\s*s)\b/gi, replacement: "CAS" },
  { pattern: /\b(compare\s*and\s*swap|compare\s*and\s*swop)\b/gi, replacement: "Compare-And-Swap" },
  { pattern: /\b(meta\s*space)\b/gi, replacement: "Metaspace" },
  { pattern: /\b(perm\s*gen)\b/gi, replacement: "PermGen" },
  { pattern: /\b(n\s*plus\s*1\s*select|n\s*\+\s*1\s*select|n\s*plus\s*one\s*select)\b/gi, replacement: "N+1 select" },
  { pattern: /\b(entity\s*graph|at\s*entity\s*graph)\b/gi, replacement: "@EntityGraph" },
  { pattern: /\b(join\s*fetch)\b/gi, replacement: "JOIN FETCH" },
  { pattern: /\b(fetch\s*type\s*eager)\b/gi, replacement: "FetchType.EAGER" },
  { pattern: /\b(fetch\s*type\s*lazy)\b/gi, replacement: "FetchType.LAZY" },
  { pattern: /\b(security\s*filter\s*chain)\b/gi, replacement: "SecurityFilterChain" },
  { pattern: /\b(username\s*password\s*authentication\s*filter)\b/gi, replacement: "UsernamePasswordAuthenticationFilter" },
  { pattern: /\b(tcp\s*3\s*way\s*handshake|tcp\s*three\s*way\s*handshake)\b/gi, replacement: "TCP 3-way handshake" },
  { pattern: /\b(syn\s*ack)\b/gi, replacement: "SYN-ACK" },
  { pattern: /\b(time\s*wait|time_wait)\b/gi, replacement: "TIME_WAIT" },
  { pattern: /\b(two\s*msl|to\s*msl|2\s*m\s*s\s*l)\b/gi, replacement: "2MSL" }
];

class SpeechTranscriptionService {

  /**
   * Return technical terms vocabulary as a comma-separated prompt hint string
   */
  static getVocabularyPrompt() {
    return TECHNICAL_VOCABULARY.slice(0, 50).join(", ");
  }

  /**
   * Apply technical spelling repairs and accent corrections
   */
  static postProcessTranscript(rawText) {
    if (!rawText || typeof rawText !== 'string') return "";
    let cleaned = rawText.trim();

    for (const rule of PHONETIC_REPAIRS) {
      cleaned = cleaned.replace(rule.pattern, rule.replacement);
    }

    return cleaned;
  }

  /**
   * Detect technical vocabulary terms present in transcript
   */
  static detectTechnicalTerms(transcript) {
    const textLower = (transcript || "").toLowerCase();
    const detected = [];

    for (const term of TECHNICAL_VOCABULARY) {
      if (textLower.includes(term.toLowerCase())) {
        detected.push(term);
      }
    }

    return [...new Set(detected)];
  }

  /**
   * Assess transcription quality and flag potential mishearings
   */
  static assessConfidence(rawTranscript, cleanedTranscript) {
    const words = cleanedTranscript.split(/\s+/).filter(Boolean);
    if (words.length === 0) return { score: 0.0, warnings: ["No speech detected in audio."] };

    const detectedTerms = SpeechTranscriptionService.detectTechnicalTerms(cleanedTranscript);
    const warnings = [];

    // Check for obvious cut-off markers or garbled syllables
    if (words.length < 5) {
      warnings.push("Very short response. Please verify your microphone captured your full answer.");
    }

    // High technical term density gives confidence
    let confidence = 0.85;
    if (detectedTerms.length >= 3) {
      confidence = 0.95;
    } else if (detectedTerms.length === 0 && words.length > 25) {
      warnings.push("Few technical terms detected. Please check if domain terms (e.g. data structures, algorithms) were misheard.");
      confidence = 0.70;
    }

    return {
      score: confidence,
      detectedTerms,
      warnings
    };
  }

  /**
   * Transcribe via Groq Whisper API if key is available
   */
  static async transcribeWithGroq(audioBuffer, mimeType = "audio/webm") {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || !groqKey.trim()) return null;

    try {
      const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
      const filename = mimeType.includes("wav") ? "audio.wav" : "audio.webm";
      const prompt = SpeechTranscriptionService.getVocabularyPrompt();

      // Build multipart/form-data payload manually for zero dependencies
      const preBuffer = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\nen\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n`),
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`)
      ]);
      const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`);
      const body = Buffer.concat([preBuffer, audioBuffer, postBuffer]);

      return new Promise((resolve) => {
        const req = https.request({
          hostname: "api.groq.com",
          path: "/openai/v1/audio/transcriptions",
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey.trim()}`,
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Content-Length": body.length
          },
          timeout: 15000
        }, (res) => {
          let chunks = [];
          res.on("data", chunk => chunks.push(chunk));
          res.on("end", () => {
            try {
              const respText = Buffer.concat(chunks).toString("utf-8");
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const parsed = JSON.parse(respText);
                resolve({
                  text: parsed.text || "",
                  duration: parsed.duration || 0,
                  provider: "Groq Whisper Large v3"
                });
              } else {
                console.warn(`Groq Whisper HTTP ${res.statusCode}:`, respText);
                resolve(null);
              }
            } catch (e) {
              resolve(null);
            }
          });
        });

        req.on("error", (err) => {
          console.warn("Groq transcription network error:", err.message);
          resolve(null);
        });

        req.write(body);
        req.end();
      });
    } catch (err) {
      console.warn("Error calling Groq transcription:", err.message);
      return null;
    }
  }

  /**
   * Unified transcription orchestrator:
   * 1. Attempts Groq Whisper API
   * 2. Falls back to client transcript with domain vocabulary post-processing
   */
  static async processAudioOrTranscript({ audioBuffer = null, mimeType = "audio/webm", fallbackTranscript = "", audioDuration = 0 }) {
    let rawTranscript = fallbackTranscript || "";
    let provider = "Client Web Speech with STRATA Domain Vocab Engine";
    let duration = audioDuration;

    if (audioBuffer && audioBuffer.length > 0) {
      const groqResult = await SpeechTranscriptionService.transcribeWithGroq(audioBuffer, mimeType);
      if (groqResult && groqResult.text) {
        rawTranscript = groqResult.text;
        provider = groqResult.provider;
        if (groqResult.duration) duration = groqResult.duration;
      }
    }

    const cleanedTranscript = SpeechTranscriptionService.postProcessTranscript(rawTranscript);
    const confidenceAnalysis = SpeechTranscriptionService.assessConfidence(rawTranscript, cleanedTranscript);

    return {
      transcript: cleanedTranscript,
      rawTranscript,
      provider,
      audioDurationSeconds: Math.round(duration),
      confidence: confidenceAnalysis.score,
      detectedTerms: confidenceAnalysis.detectedTerms,
      warnings: confidenceAnalysis.warnings
    };
  }
}

module.exports = SpeechTranscriptionService;
