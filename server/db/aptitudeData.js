/**
 * High-Rigor Quantitative & Aptitude Question Bank
 * Covers 8 Core Placement Domains:
 * 1. Arithmetic & Business Math (Percentages, Ratios, Averages, Profit/Loss, Mixtures)
 * 2. Work, Rates & Pipes (Time & Work, Pipes & Cisterns, Relative Efficiency)
 * 3. Speed, Distance & Time (Relative Speed, Boats & Streams, Harmonic Mean)
 * 4. Number Systems & Divisibility (Cycles, Remainders, HCF & LCM)
 * 5. Algebra & Equations (Linear Systems, Quadratic Discriminant, Progressions)
 * 6. Probability & Combinatorics (Permutations with restrictions, Independent Draws, Team Selection)
 * 7. Data Interpretation (ARR Percentage Growth, Pie Chart Angles, Shard Throughput Ratios)
 * 8. Logical Reasoning & Syllogisms (Sequences, Deductive Syllogisms, Seating Arrangements)
 */

const APTITUDE_QUESTIONS = [
  // ─── 1. ARITHMETIC & BUSINESS MATH ─────────────────────────────
  {
    id: "q-apti-arith-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Arithmetic & Business Math",
    subtopic: "Percentages & Price Elasticity",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Expenditure Invariance on Price Surge",
    description: "The unit price of cloud compute hardware increases by 25%. By what percentage must an infrastructure team reduce its monthly usage so that total expenditure remains strictly unchanged?",
    options: ["20%", "25%", "16.67%", "22.5%"],
    correctAnswerIndex: 0,
    explanation: "Let initial price be P and consumption be C. Initial expenditure = P × C. When price increases to 1.25 P, the required new consumption C' satisfies 1.25 P × C' = P × C, meaning C' = C / 1.25 = 0.80 C. The required reduction is C - 0.80 C = 0.20 C, which is exactly 20%.",
    hints: ["If the price becomes 5/4 of the original, consumption must scale to 4/5 of the original to maintain parity."],
    conceptTags: ["percentages", "arithmetic", "expenditure", "elasticity"]
  },
  {
    id: "q-apti-arith-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Arithmetic & Business Math",
    subtopic: "Ratios & Partnership Capital",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Partnership Profit Distribution with Mid-Year Entry",
    description: "Alice and Bob start a venture investing capital in the ratio 3 : 5. After 6 months, Charlie joins the partnership with capital equal to Bob's. At the end of the 1-year fiscal period, the firm yields a total profit of $63,000. What is Charlie's earned share of the profit?",
    options: ["$15,000", "$18,000", "$30,000", "$12,500"],
    correctAnswerIndex: 0,
    explanation: "Profit in a commercial partnership is distributed in proportion to (Capital × Time). Let units of capital be Alice = 3, Bob = 5, Charlie = 5. Effective investment units over 12 months: Alice = 3 × 12 = 36; Bob = 5 × 12 = 60; Charlie = 5 × 6 = 30. Ratio of profits = 36 : 60 : 30 = 6 : 10 : 5. Total parts = 6 + 10 + 5 = 21 parts. Charlie's share = (5 / 21) × $63,000 = 5 × $3,000 = $15,000.",
    hints: ["Multiply each partner's capital weighting by the exact number of months their capital was deployed."],
    conceptTags: ["ratios", "partnerships", "profit-sharing"]
  },
  {
    id: "q-apti-arith-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Arithmetic & Business Math",
    subtopic: "Mixtures & Repeated Dilution",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Repeated Dilution of Pure Coolant",
    description: "A server cooling reservoir contains 80 liters of pure dielectric coolant. A technician extracts 8 liters of coolant and replaces it with distilled water. This replacement procedure is performed a total of 3 consecutive times. What is the final volume of pure coolant remaining in the reservoir?",
    options: ["58.32 liters", "56.00 liters", "61.44 liters", "54.80 liters"],
    correctAnswerIndex: 0,
    explanation: "By the repeated dilution invariant: Remaining Pure Liquid = Initial Volume × (1 - x / V)^n, where V = 80 L initial volume, x = 8 L replaced each cycle, and n = 3 iterations. Remaining Volume = 80 × (1 - 8 / 80)^3 = 80 × (0.9)^3 = 80 × 0.729 = 58.32 liters.",
    hints: ["After each extraction and replacement, exactly 90% (or 9/10) of the remaining pure liquid is preserved."],
    conceptTags: ["mixtures", "alligation", "repeated-dilution"]
  },

  // ─── 2. WORK, RATES & PIPES ─────────────────────────────────────
  {
    id: "q-apti-work-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Work, Rates & Pipes",
    subtopic: "Time & Work Collaboration",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Collaborative Database Migration Work Rate",
    description: "Staff Engineer A can complete a production database migration in 12 hours, while Engineer B can complete the same migration in 24 hours. If both engineers execute concurrently on parallel non-conflicting shards, how many hours will the complete migration take?",
    options: ["8 hours", "6 hours", "9 hours", "7.5 hours"],
    correctAnswerIndex: 0,
    explanation: "Engineer A completes 1/12 of the migration per hour. Engineer B completes 1/24 per hour. Combined rate = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 = 1/8 per hour. Total duration required = 1 / (1/8) = 8 hours.",
    hints: ["Sum their individual fractional rates per hour and take the reciprocal."],
    conceptTags: ["time-and-work", "rates", "collaboration"]
  },
  {
    id: "q-apti-work-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Work, Rates & Pipes",
    subtopic: "Pipes & Cisterns Inflow/Outflow",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Combined Inlet and Leak Flow Rate",
    description: "Inlet Pipe A fills a liquid reservoir in 6 hours, and Inlet Pipe B fills it in 8 hours. An emergency drain pipe C can evacuate a full reservoir in 12 hours. If all three pipes are opened simultaneously from an empty state, how long will it take to fill the reservoir completely?",
    options: ["4 hours 48 minutes", "5 hours 15 minutes", "4 hours 30 minutes", "5 hours 00 minutes"],
    correctAnswerIndex: 0,
    explanation: "Net hourly filling rate = Rate(A) + Rate(B) - Rate(C) = 1/6 + 1/8 - 1/12. Using the common denominator 24: (4 + 3 - 2) / 24 = 5 / 24 of the tank per hour. Time to fill = 24 / 5 hours = 4.8 hours = 4 hours + (0.8 × 60) minutes = 4 hours 48 minutes.",
    hints: ["Outflow/drain pipes represent a negative work contribution."],
    conceptTags: ["pipes-and-cisterns", "flow-rates", "inflow-outflow"]
  },
  {
    id: "q-apti-work-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Work, Rates & Pipes",
    subtopic: "Work with Worker Departure",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Sprint Backlog Completion after Developer Departure",
    description: "Developer X can complete a critical service backlog in 16 days, and Developer Y can complete it in 24 days. They work together for 6 days, after which Developer X is pulled to an urgent production outage. In how many additional days will Developer Y complete the remaining backlog alone?",
    options: ["9 days", "10 days", "8 days", "12 days"],
    correctAnswerIndex: 0,
    explanation: "Combined daily rate = 1/16 + 1/24 = (3 + 2) / 48 = 5/48. In 6 days of paired work, completed portion = 6 × (5/48) = 30/48 = 5/8. Remaining work = 1 - 5/8 = 3/8. Time required for Developer Y to finish remaining work = (3/8) / (1/24) = (3/8) × 24 = 9 days.",
    hints: ["Calculate the fraction of work completed in the first 6 days, then divide the remaining fraction by Developer Y's daily rate."],
    conceptTags: ["time-and-work", "backlog", "rate-depletion"]
  },

  // ─── 3. SPEED, DISTANCE & TIME ──────────────────────────────────
  {
    id: "q-apti-speed-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Speed, Distance & Time",
    subtopic: "Harmonic Mean Average Speed",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Round-Trip Commute Average Velocity",
    description: "An engineer commutes from home to an engineering campus at 60 km/h and returns along the exact same path at 40 km/h. What is the average speed across the complete round trip?",
    options: ["48 km/h", "50 km/h", "45 km/h", "52 km/h"],
    correctAnswerIndex: 0,
    explanation: "For equal distances covered at speeds x and y, the average speed is given by the harmonic mean: (2 × x × y) / (x + y). Here: (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h. (Note: It is not the simple arithmetic mean of 50 km/h because more time is spent traveling at the lower speed).",
    hints: ["Total distance divided by total time yields the harmonic mean 2xy / (x + y)."],
    conceptTags: ["speed-distance-time", "harmonic-mean", "average-speed"]
  },
  {
    id: "q-apti-speed-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Speed, Distance & Time",
    subtopic: "Relative Speed & Opposing Trains",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Parallel Tracks Train Crossing Time",
    description: "Two high-speed trains measuring 140 meters and 160 meters in length travel toward each other on parallel tracks at 72 km/h and 54 km/h respectively. From the instant their front ends align, how many seconds will it take for the two trains to completely pass each other?",
    options: ["8.57 seconds", "10.20 seconds", "7.50 seconds", "9.45 seconds"],
    correctAnswerIndex: 0,
    explanation: "Total relative distance to clear = length(Train 1) + length(Train 2) = 140 m + 160 m = 300 meters. Relative velocity in opposing directions = 72 + 54 = 126 km/h. Convert to m/s: 126 × (5 / 18) = 7 × 5 = 35 m/s. Crossing time = Total Distance / Relative Velocity = 300 / 35 = 60 / 7 ≈ 8.57 seconds.",
    hints: ["Convert relative speed from km/h to m/s by multiplying by 5/18."],
    conceptTags: ["relative-speed", "trains", "motion"]
  },
  {
    id: "q-apti-speed-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Speed, Distance & Time",
    subtopic: "Boats and Streams Vectors",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Upstream and Downstream River Velocity",
    description: "A pipeline inspection drone travels 48 km downstream with the current in 3 hours, and returns upstream against the current covering the same 48 km in 6 hours. What is the speed of the drone in still water and the velocity of the water stream?",
    options: ["Drone: 12 km/h, Stream: 4 km/h", "Drone: 10 km/h, Stream: 6 km/h", "Drone: 14 km/h, Stream: 2 km/h", "Drone: 15 km/h, Stream: 3 km/h"],
    correctAnswerIndex: 0,
    explanation: "Downstream speed (v + u) = 48 km / 3 h = 16 km/h. Upstream speed (v - u) = 48 km / 6 h = 8 km/h. Adding the equations: 2v = 24 => v = 12 km/h (speed in still water). Subtracting: 2u = 8 => u = 4 km/h (speed of stream).",
    hints: ["Speed in still water is the average of downstream and upstream speeds."],
    conceptTags: ["boats-and-streams", "vector-addition", "relative-velocity"]
  },

  // ─── 4. NUMBER SYSTEMS & DIVISIBILITY ───────────────────────────
  {
    id: "q-apti-num-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Number Systems & Divisibility",
    subtopic: "LCM of Synchronized Cycles",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Periodic Microservice Heartbeat Synchronization",
    description: "Three background daemon workers emit telemetry heartbeats every 12 seconds, 18 seconds, and 30 seconds respectively. If all three daemons emit a heartbeat simultaneously at 10:00:00 AM, how many seconds later will they emit a heartbeat concurrently again?",
    options: ["180 seconds", "120 seconds", "360 seconds", "90 seconds"],
    correctAnswerIndex: 0,
    explanation: "The next simultaneous event occurs at the Least Common Multiple (LCM) of the three periods: 12 = 2^2 × 3; 18 = 2 × 3^2; 30 = 2 × 3 × 5. LCM = 2^2 × 3^2 × 5 = 4 × 9 × 5 = 180 seconds (3 minutes).",
    hints: ["Find the LCM of 12, 18, and 30 using prime factorizations."],
    conceptTags: ["lcm", "number-theory", "periodic-events"]
  },
  {
    id: "q-apti-num-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Number Systems & Divisibility",
    subtopic: "Unit Digit Cyclicity",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Last Digit of Exponential Expression",
    description: "What is the units digit of the arithmetic difference (7^95 - 3^58)?",
    options: ["4", "6", "2", "8"],
    correctAnswerIndex: 0,
    explanation: "Units digits of powers of 7 have a 4-term cycle: 7^1->7, 7^2->9, 7^3->3, 7^4->1. 95 mod 4 = 3, so 7^95 ends in 3. Units digits of powers of 3 have a 4-term cycle: 3^1->3, 3^2->9, 3^3->7, 3^4->1. 58 mod 4 = 2, so 3^58 ends in 9. For the difference (7^95 - 3^58), units digit is 3 - 9 with borrow = 13 - 9 = 4.",
    hints: ["Determine the cyclicity length (period 4) for both base 7 and base 3."],
    conceptTags: ["cyclicity", "units-digit", "exponents"]
  },
  {
    id: "q-apti-num-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Number Systems & Divisibility",
    subtopic: "Modular Arithmetic & Fermat's Little Theorem",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Remainder of High Power Modulo Prime",
    description: "What is the remainder when 2^100 is divided by the prime integer 7?",
    options: ["2", "4", "1", "6"],
    correctAnswerIndex: 0,
    explanation: "Notice the modular powers of 2 mod 7: 2^1 = 2, 2^2 = 4, 2^3 = 8 ≡ 1 (mod 7). Since 2^3 ≡ 1 (mod 7), the period is 3. 100 = 3 × 33 + 1. Therefore, 2^100 = (2^3)^33 × 2^1 ≡ (1)^33 × 2 ≡ 2 (mod 7). The remainder is 2.",
    hints: ["Observe that 2^3 = 8 leaves a remainder of 1 when divided by 7."],
    conceptTags: ["modular-arithmetic", "remainders", "number-theory"]
  },

  // ─── 5. ALGEBRA & EQUATIONS ─────────────────────────────────────
  {
    id: "q-apti-alg-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Algebra & Equations",
    subtopic: "Linear Systems in Two Variables",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Server Provisioning Cost System",
    description: "A cloud platform deploys 4 compute instances and 5 memory instances for $350/month. A secondary tier deploys 3 compute instances and 2 memory instances for $210/month. What is the individual monthly cost of 1 compute instance?",
    options: ["$50", "$45", "$30", "$60"],
    correctAnswerIndex: 0,
    explanation: "Let c = compute cost, m = memory cost. Eq 1: 4c + 5m = 350. Eq 2: 3c + 2m = 210. Multiply Eq 1 by 2: 8c + 10m = 700. Multiply Eq 2 by 5: 15c + 10m = 1050. Subtracting the two: 7c = 350 => c = 50. (Substitute c=50: 3(50) + 2m = 210 => 2m = 60 => m = 30). Monthly cost of 1 compute instance is $50.",
    hints: ["Eliminate the memory variable m by finding a common multiple of 5 and 2."],
    conceptTags: ["linear-equations", "systems", "algebra"]
  },
  {
    id: "q-apti-alg-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Algebra & Equations",
    subtopic: "Quadratic Discriminant Invariants",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Equal Roots Condition in Quadratic Latency Model",
    description: "In an algorithmic latency model defined by the quadratic equation x^2 - (k + 2)x + (k + 5) = 0, what positive value of k guarantees that the system produces real and equal roots (zero latency variance)?",
    options: ["4", "6", "2", "8"],
    correctAnswerIndex: 0,
    explanation: "A quadratic ax^2 + bx + c = 0 has real and equal roots if and only if the discriminant Δ = b^2 - 4ac = 0. Here, a = 1, b = -(k + 2), c = (k + 5). Δ = [-(k + 2)]^2 - 4(1)(k + 5) = (k^2 + 4k + 4) - (4k + 20) = k^2 - 16. Setting Δ = 0: k^2 - 16 = 0 => k^2 = 16 => k = ±4. Since a positive value is specified, k = 4.",
    hints: ["Set the discriminant b^2 - 4ac equal to 0 and solve for positive k."],
    conceptTags: ["quadratic-equations", "discriminant", "algebra"]
  },
  {
    id: "q-apti-alg-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Algebra & Equations",
    subtopic: "Arithmetic Progression Sum Formula",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Nth Term from AP Sum Function",
    description: "The cumulative sum of the first n latency metrics in an audit stream is represented by S_n = 3n^2 + 5n. What is the exact value of the 15th individual latency metric (T_15)?",
    options: ["92", "95", "88", "101"],
    correctAnswerIndex: 0,
    explanation: "The nth term of any sequence is given by T_n = S_n - S_{n-1}. For S_n = 3n^2 + 5n: T_n = (3n^2 + 5n) - [3(n - 1)^2 + 5(n - 1)] = (3n^2 + 5n) - [3(n^2 - 2n + 1) + 5n - 5] = (3n^2 + 5n) - (3n^2 - n - 2) = 6n + 2. For n = 15: T_15 = 6(15) + 2 = 90 + 2 = 92.",
    hints: ["Recall the fundamental relation T_n = S_n - S_{n-1}."],
    conceptTags: ["arithmetic-progression", "series", "algebra"]
  },

  // ─── 6. PROBABILITY & COMBINATORICS ─────────────────────────────
  {
    id: "q-apti-prob-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Probability & Combinatorics",
    subtopic: "Permutations with Bound Vowel Block",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Permutations with Bound Vowel Block",
    description: "In how many distinct ways can the letters of the word 'ENGINEER' be arranged such that all three 'E's remain grouped together as a contiguous block?",
    options: ["360", "720", "120", "480"],
    correctAnswerIndex: 0,
    explanation: "The word 'ENGINEER' contains 8 letters: E:3, N:2, G:1, I:1, R:1. Treat the three 'E's as one single atomic item [EEE]. The items to arrange are [EEE], N, N, G, I, R (total 6 items, with N repeated 2 times). The number of arrangements is 6! / 2! = 720 / 2 = 360. Internal permutations of identical 'E's is 3! / 3! = 1, so total distinct arrangements = 360.",
    hints: ["Treat the identical vowels as one combined unit and divide by factorial of repeated consonants."],
    conceptTags: ["permutations", "combinatorics", "word-arrangement"]
  },
  {
    id: "q-apti-prob-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Probability & Combinatorics",
    subtopic: "Dependent Probability without Replacement",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Consecutive Ace Probability in Card Draw",
    description: "Two cards are drawn consecutively without replacement from a thoroughly shuffled standard deck of 52 cards. What is the probability that both selected cards are Aces?",
    options: ["1 / 221", "1 / 169", "4 / 663", "1 / 204"],
    correctAnswerIndex: 0,
    explanation: "There are 4 Aces in a 52-card deck. Probability of drawing the first Ace = 4 / 52 = 1 / 13. Given the first Ace was drawn, 3 Aces remain among 51 remaining cards. Probability of drawing the second Ace = 3 / 51 = 1 / 17. The joint probability is (1 / 13) × (1 / 17) = 1 / 221.",
    hints: ["Multiply the probability of the first event by the conditional probability of the second event."],
    conceptTags: ["probability", "cards", "conditional-probability"]
  },
  {
    id: "q-apti-prob-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Probability & Combinatorics",
    subtopic: "Combinations with At-Least Constraints",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Diverse Engineering Committee Formation",
    description: "An architecture review board of 5 engineers is to be selected from a pool of 6 backend developers and 4 frontend developers. What is the probability that the committee contains at least 3 frontend developers?",
    options: ["11 / 42", "5 / 21", "13 / 42", "8 / 21"],
    correctAnswerIndex: 0,
    explanation: "Total ways to choose 5 from 10 developers = C(10, 5) = 252. Favorable outcomes ('at least 3 frontend'): Case 1: Exactly 3 frontend and 2 backend = C(4, 3) × C(6, 2) = 4 × 15 = 60. Case 2: Exactly 4 frontend and 1 backend = C(4, 4) × C(6, 1) = 1 × 6 = 6. Total favorable ways = 60 + 6 = 66. Probability = 66 / 252 = 11 / 42.",
    hints: ["Break the condition into mutually exclusive cases: exactly 3 frontend and exactly 4 frontend."],
    conceptTags: ["combinations", "probability", "team-selection"]
  },

  // ─── 7. DATA INTERPRETATION ─────────────────────────────────────
  {
    id: "q-apti-di-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Data Interpretation",
    subtopic: "Tabular Percentage Growth",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Multi-Year ARR Expansion Rate",
    description: "An enterprise SaaS platform records Annual Recurring Revenue (ARR) across 4 consecutive years: Year 1 = $12M, Year 2 = $18M, Year 3 = $27M, Year 4 = $40.5M. What is the total percentage growth in ARR from Year 1 to Year 4?",
    options: ["237.5%", "250.0%", "215.0%", "337.5%"],
    correctAnswerIndex: 0,
    explanation: "Percentage growth = [(Revenue Year 4 - Revenue Year 1) / Revenue Year 1] × 100 = [($40.5M - $12M) / $12M] × 100 = ($28.5M / $12M) × 100 = 2.375 × 100 = 237.5%.",
    hints: ["Calculate (Final - Initial) / Initial × 100."],
    conceptTags: ["data-interpretation", "growth-rate", "percentages"]
  },
  {
    id: "q-apti-di-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Data Interpretation",
    subtopic: "Pie Chart Angular Allocation",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "R&D and Security Combined Budget Slice",
    description: "In an enterprise IT annual expenditure pie chart (totaling 360°), Cloud Infrastructure accounts for 108°, Application Security accounts for 54°, Staff Salaries account for 144°, and Office Overhead accounts for the remaining 54°. What combined percentage of the total budget is allocated to Cloud Infrastructure and Application Security?",
    options: ["45%", "40%", "50%", "37.5%"],
    correctAnswerIndex: 0,
    explanation: "Combined angle for Cloud Infrastructure and Application Security = 108° + 54° = 162°. The percentage of the 360° total is (162° / 360°) × 100 = (9 / 20) × 100 = 45%.",
    hints: ["Find the sum of degrees for the target categories and divide by 360."],
    conceptTags: ["data-interpretation", "pie-chart", "angular-percentage"]
  },
  {
    id: "q-apti-di-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Data Interpretation",
    subtopic: "Comparative Bar Chart Ratios",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Comparative Shard Throughput Ratio",
    description: "Database Shards Alpha and Beta log write operations across three quarters: Q1: Alpha=45k, Beta=30k; Q2: Alpha=65k, Beta=40k; Q3: Alpha=70k, Beta=50k. What is the ratio of cumulative transactions processed by Shard Alpha to Shard Beta across all three quarters?",
    options: ["3 : 2", "4 : 3", "7 : 5", "5 : 3"],
    correctAnswerIndex: 0,
    explanation: "Total transactions for Shard Alpha = 45k + 65k + 70k = 180k. Total transactions for Shard Beta = 30k + 40k + 50k = 120k. Cumulative ratio = 180k : 120k = 18 : 12 = 3 : 2.",
    hints: ["Compute the three-quarter sum for each shard independently before reducing the ratio."],
    conceptTags: ["data-interpretation", "ratios", "bar-chart"]
  },

  // ─── 8. LOGICAL REASONING & SYLLOGISMS ───────────────────────────
  {
    id: "q-apti-logic-01",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Logical Reasoning & Syllogisms",
    subtopic: "Polynomial Progression Sequence",
    difficulty: "Easy",
    questionType: "multiple_choice",
    title: "Polynomial Progression Sequence",
    description: "Determine the next logical number in the progression: 2, 6, 12, 20, 30, 42, ___",
    options: ["56", "54", "58", "60"],
    correctAnswerIndex: 0,
    explanation: "Look at the differences between successive terms: 6 - 2 = 4; 12 - 6 = 6; 20 - 12 = 8; 30 - 20 = 10; 42 - 30 = 12. The differences increase by 2 each step. The next difference is 14. Therefore, next term = 42 + 14 = 56. (Alternatively, terms follow n(n + 1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42, 7×8=56).",
    hints: ["Inspect the differences between consecutive elements or relate each term to n × (n + 1)."],
    conceptTags: ["sequences", "number-series", "logical-reasoning"]
  },
  {
    id: "q-apti-logic-02",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Logical Reasoning & Syllogisms",
    subtopic: "Formal Deductive Syllogisms",
    difficulty: "Medium",
    questionType: "multiple_choice",
    title: "Formal Inferences on Compiled Binaries",
    description: "Consider the given formal premises:\nPremise 1: All compiled binaries are executable files.\nPremise 2: Some executable files are security vulnerabilities.\n\nWhich of the following conclusions logically and necessarily follows?\nConclusion I: Some security vulnerabilities are compiled binaries.\nConclusion II: Some executable files are compiled binaries.",
    options: ["Only Conclusion II follows", "Only Conclusion I follows", "Both Conclusions I and II follow", "Neither Conclusion I nor II follows"],
    correctAnswerIndex: 0,
    explanation: "Premise 1 is a universal affirmative (A: All C are E). Its direct valid conversion is 'Some E are C' (Conclusion II is always valid). Premise 2 is a particular affirmative (I: Some E are V). Because the middle term 'executable files' is undistributed in both premises, no definitive conclusion can be drawn linking 'security vulnerabilities' and 'compiled binaries' (Conclusion I is invalid). Thus, only Conclusion II follows.",
    hints: ["'All A are B' always validates 'Some B are A', but undistributed middle terms prevent transitive deductions."],
    conceptTags: ["syllogisms", "deductive-logic", "reasoning"]
  },
  {
    id: "q-apti-logic-03",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Logical Reasoning & Syllogisms",
    subtopic: "Linear Seating Invariants",
    difficulty: "Hard",
    questionType: "multiple_choice",
    title: "Linear Bench Arrangement Deductions",
    description: "Five software engineers (P, Q, R, S, T) sit in a row facing North at an engineering hackathon bench:\n1. S sits directly between T and Q.\n2. Q is seated immediately to the left of R.\n3. P is seated immediately to the left of T.\nWho is seated in the exact middle position of the row?",
    options: ["S", "T", "Q", "P"],
    correctAnswerIndex: 0,
    explanation: "Let positions 1 to 5 be from left to right facing North. Clue 3: P is immediately left of T -> ordered pair [P, T]. Clue 1: S is between T and Q -> since T is left of S, Q must be to the right of S -> [T, S, Q]. Combining gives [P, T, S, Q]. Clue 2: Q is immediately left of R -> sequence becomes [P, T, S, Q, R] occupying positions 1, 2, 3, 4, 5. Position 3 (the exact center) is occupied by S.",
    hints: ["Assemble the relative left-to-right constraints into one contiguous sequence."],
    conceptTags: ["seating-arrangement", "linear-logic", "analytical-reasoning"]
  }
];

const APTITUDE_TESTS = [
  {
    id: "sprint-aptitude-core",
    title: "Sprint Delta: Quantitative Reasoning & Analytical Diagnostic",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Arithmetic, Work Rates, Motion, Numbers, Algebra, Probability, Logic",
    questionIds: [
      "q-apti-arith-01",
      "q-apti-arith-02",
      "q-apti-work-01",
      "q-apti-work-02",
      "q-apti-speed-01",
      "q-apti-speed-02",
      "q-apti-num-01",
      "q-apti-alg-02",
      "q-apti-prob-01",
      "q-apti-logic-01"
    ],
    durationMinutes: 20,
    totalMarks: 100,
    passMarks: 70,
    tierLevel: "Enterprise & Tech Ready"
  },
  {
    id: "sprint-aptitude-arithmetic",
    title: "Aptitude Sprint: Arithmetic, Work & Motion Invariants",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Percentages, Ratios, Time-Work, Speed-Distance",
    questionIds: [
      "q-apti-arith-01",
      "q-apti-arith-02",
      "q-apti-arith-03",
      "q-apti-work-01",
      "q-apti-work-03",
      "q-apti-speed-01"
    ],
    durationMinutes: 15,
    totalMarks: 60,
    passMarks: 42,
    tierLevel: "Prime / Digital"
  },
  {
    id: "sprint-aptitude-logic",
    title: "Aptitude Sprint: Probability, Number Systems & Syllogisms",
    subject: "Quantitative & Analytical Aptitude",
    topic: "Divisibility, Modular Math, Probability, Syllogisms",
    questionIds: [
      "q-apti-num-02",
      "q-apti-num-03",
      "q-apti-prob-02",
      "q-apti-prob-03",
      "q-apti-logic-02",
      "q-apti-logic-03"
    ],
    durationMinutes: 15,
    totalMarks: 60,
    passMarks: 42,
    tierLevel: "Tier-1 Diagnostic"
  }
];

const APTITUDE_TOPICS_METADATA = [
  {
    id: "arithmetic",
    title: "Arithmetic & Business Math",
    subtopics: ["Percentages", "Ratios & Partnerships", "Averages", "Profit & Loss", "Mixtures"],
    description: "Core percentage elasticity, capital partnerships, and repeated dilution invariants.",
    color: "#2DD4D0",
    icon: "Calculator"
  },
  {
    id: "work-rates",
    title: "Work, Rates & Pipes",
    subtopics: ["Time & Work", "Pipes & Cisterns", "Worker Departure", "Efficiency Ratios"],
    description: "Multi-worker concurrency, inflow/outflow balance, and backlog completion rates.",
    color: "#6D5CFF",
    icon: "Clock"
  },
  {
    id: "speed-distance",
    title: "Speed, Distance & Time",
    subtopics: ["Harmonic Mean Speed", "Relative Train Speeds", "Boats & Streams"],
    description: "Dynamic motion, opposing vector crossing, and river current velocity.",
    color: "#8B7BFF",
    icon: "Zap"
  },
  {
    id: "number-systems",
    title: "Number Systems & Divisibility",
    subtopics: ["LCM Synchronization", "Unit Digit Cyclicity", "Modular Remainders"],
    description: "Cycle theory, modular arithmetic, and integer factorization.",
    color: "#F59E0B",
    icon: "BrainCircuit"
  },
  {
    id: "algebra",
    title: "Algebra & Equations",
    subtopics: ["Linear Systems", "Quadratic Discriminant", "AP & GP Progressions"],
    description: "Cost minimization systems, discriminant root invariants, and series sums.",
    color: "#10B981",
    icon: "Code"
  },
  {
    id: "probability",
    title: "Probability & Combinatorics",
    subtopics: ["Bound Permutations", "Dependent Draws", "At-Least Combinations"],
    description: "Permutations with restrictions, card probabilities, and diverse committee selection.",
    color: "#EC4899",
    icon: "Layers"
  },
  {
    id: "data-interpretation",
    title: "Data Interpretation",
    subtopics: ["Tabular Growth", "Pie Chart Angular Slices", "Throughput Ratios"],
    description: "Multi-year revenue expansion, budget angular allocation, and shard analytics.",
    color: "#38BDF8",
    icon: "BarChart3"
  },
  {
    id: "logical-reasoning",
    title: "Logical Reasoning & Syllogisms",
    subtopics: ["Polynomial Series", "Deductive Syllogisms", "Linear Seating Invariants"],
    description: "Series pattern recognition, categorical logic, and spatial ordering constraints.",
    color: "#A855F7",
    icon: "Award"
  }
];

module.exports = {
  APTITUDE_QUESTIONS,
  APTITUDE_TESTS,
  APTITUDE_TOPICS_METADATA
};
