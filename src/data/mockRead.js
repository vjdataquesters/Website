// Mock "May 2026" edition for previewing the /reads book UI without a published
// backend edition. The Reads page falls back to this when the API has no edition
// yet. Reads are grouped into chapters by category. Safe to delete once real
// editions are published.

let _n = 0;
const mk = (category, title, sourceName, summary, takeaways, score, url) => ({
  id: `mock-${++_n}`,
  editionId: "2026-05",
  url,
  sourceName,
  title,
  summary,
  takeaways,
  category,
  score,
  status: "published",
  order: _n,
});

const articles = [
  // ── Chapter: AI Advancement ─────────────────────────────────────────────
  mk(
    "AI Advancement",
    "Retrieval-Augmented Generation, Explained",
    "wikipedia.org",
    "RAG enhances large language models by letting them pull information from external, authoritative sources before answering. It grounds responses in real data — cutting hallucinations and adding citations — without the cost of retraining.",
    [
      "RAG injects fresh, domain-specific context at query time instead of into the weights.",
      "It measurably reduces hallucinations by anchoring answers to retrieved passages.",
      "A vector store plus a retriever is often cheaper to update than fine-tuning.",
      "Citations become possible, making output auditable and trustworthy.",
    ],
    9,
    "https://en.wikipedia.org/wiki/Retrieval-augmented_generation",
  ),
  mk(
    "AI Advancement",
    "Small Models, Big Month: On-Device Inference",
    "arxiv.org",
    "A wave of sub-4B-parameter models now matches last year's flagships on reasoning benchmarks. Quantization and distillation have made capable local inference a default option, not a compromise.",
    [
      "Distilled small models rival much larger ones on many practical tasks.",
      "On-device inference sidesteps latency, cost, and privacy in one move.",
      "The gap between 'frontier' and 'good enough' is narrowing fast.",
    ],
    8,
    "https://arxiv.org/",
  ),
  mk(
    "AI Advancement",
    "Agents That Actually Ship: Tool-Use Patterns",
    "anthropic.com",
    "The most reliable agent systems this year lean on narrow, well-typed tools and human-in-the-loop checkpoints rather than fully autonomous loops. Structure beats cleverness.",
    [
      "Typed, single-purpose tools are more reliable than open-ended action spaces.",
      "A draft-then-approve step keeps a human's judgment in the loop cheaply.",
      "Observability into each tool call is what makes agents debuggable.",
    ],
    8,
    "https://www.anthropic.com/",
  ),
  mk(
    "AI Advancement",
    "Evaluations Are the New Unit Tests",
    "huggingface.co",
    "As teams move LLM features to production, eval suites — not vibes — decide what ships. The month's theme: treat prompts and models like code, with regression tests on real examples.",
    [
      "Golden-set evals catch prompt regressions before users do.",
      "LLM-as-judge scales grading but needs its own calibration.",
      "Track eval scores over time the way you track test coverage.",
    ],
    7,
    "https://huggingface.co/",
  ),
  mk(
    "AI Advancement",
    "Context Windows Keep Growing — Should You Care?",
    "google.dev",
    "Million-token context is now common, but bigger windows aren't a free lunch: cost, latency, and 'lost-in-the-middle' recall all matter. Retrieval still earns its place.",
    [
      "Huge contexts raise cost and latency; use them deliberately.",
      "Models still recall the middle of long inputs poorly.",
      "Retrieval + a modest context often beats stuffing everything in.",
    ],
    7,
    "https://ai.google.dev/",
  ),

  // ── Chapter: Prod Issue ─────────────────────────────────────────────────
  mk(
    "Prod Issue",
    "Postmortem: The Config Push That Took Down the Edge",
    "cloudflare.com",
    "A single-character regex mistake rolled out globally in seconds, spiking CPU on every edge node and cascading into a widespread outage. The fix was fast; the lesson — staged rollouts and a kill switch — was the real takeaway.",
    [
      "Global config changes need staged, canary-first rollouts — never all at once.",
      "A rehearsed rollback beats a clever fix under pressure.",
      "Regex in a hot path is a performance landmine; bound and test it.",
      "Every global system needs a reachable kill switch.",
    ],
    9,
    "https://www.cloudflare.com/en-in/learning/ddos/what-is-a-ddos-attack/",
  ),
  mk(
    "Prod Issue",
    "The Retry Storm That DDoS'd Ourselves",
    "aws.amazon.com",
    "A brief downstream blip triggered aggressive client retries, which amplified load until the healthy service fell over too. Exponential backoff with jitter turned the incident from hours into minutes.",
    [
      "Naive retries turn a small blip into a self-inflicted outage.",
      "Backoff with jitter spreads load and breaks the amplification loop.",
      "Circuit breakers fail fast instead of piling on.",
    ],
    8,
    "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
  ),
  mk(
    "Prod Issue",
    "When the Cache Became the Source of Truth",
    "redis.io",
    "A subtle write path let stale cache entries outlive their database rows, and reads silently served ghosts. The fix was boring and correct: single-writer invalidation and TTLs everyone understood.",
    [
      "Caches drift from the DB unless invalidation is airtight.",
      "TTLs are a safety net, not a correctness strategy.",
      "One clear write path beats several clever ones.",
    ],
    7,
    "https://redis.io/",
  ),
  mk(
    "Prod Issue",
    "Migrations at 3AM: A Zero-Downtime Story",
    "postgresql.org",
    "Adding a NOT NULL column to a huge table locked writes and paged the team. The rewrite — backfill in batches, then flip the constraint — is now the house playbook.",
    [
      "Schema changes on big tables need online, batched backfills.",
      "Add columns nullable first; enforce constraints after backfill.",
      "Test migrations against production-sized data, not toy datasets.",
    ],
    7,
    "https://www.postgresql.org/",
  ),
  mk(
    "Prod Issue",
    "The Time Zone Bug That Ate a Day of Orders",
    "developer.mozilla.org",
    "A server assuming UTC and a client assuming local time quietly shifted timestamps by hours, mis-bucketing a day of analytics. Storing UTC everywhere and formatting only at the edge closed it.",
    [
      "Store and compute in UTC; localize only for display.",
      "Timestamp bugs hide in reports long before anyone notices.",
      "Make the timezone explicit at every boundary.",
    ],
    6,
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date",
  ),

  // ── Chapter: Global Tech News ───────────────────────────────────────────
  mk(
    "Global Tech News",
    "The Quiet Comeback of CSS-Only Layouts",
    "developer.mozilla.org",
    "Modern CSS — container queries, subgrid, multi-column flow — now handles layouts that used to demand JavaScript. Lighter, faster, more resilient pages are the payoff.",
    [
      "Container queries let components adapt to their space, not the viewport.",
      "CSS columns give a newspaper feel with almost no code.",
      "Less layout JS means fewer bugs and faster first paint.",
    ],
    7,
    "https://developer.mozilla.org/en-US/docs/Web/CSS/columns",
  ),
  mk(
    "Global Tech News",
    "WebGPU Goes Mainstream in the Browser",
    "web.dev",
    "With broad browser support landing, WebGPU brings near-native compute and graphics to the web — powering on-device ML and rich visuals without plugins.",
    [
      "WebGPU unlocks GPU compute directly in the browser.",
      "On-device ML inference in the tab is now realistic.",
      "Expect richer visualizations without native apps.",
    ],
    7,
    "https://web.dev/",
  ),
  mk(
    "Global Tech News",
    "Open Source Funding Gets Serious",
    "opensource.org",
    "A month of announcements pointed at sustainable maintainer funding — the infrastructure everyone depends on finally getting budget lines instead of goodwill.",
    [
      "Critical libraries are maintained by a handful of volunteers.",
      "Funding models are shifting from donations to contracts.",
      "Supply-chain security starts with paying maintainers.",
    ],
    6,
    "https://opensource.org/",
  ),
  mk(
    "Global Tech News",
    "The Rust-in-Everything Trend Continues",
    "rust-lang.org",
    "From kernels to CLI tools to web backends, Rust adoption kept climbing this month — driven by memory safety and performance without a garbage collector.",
    [
      "Memory safety without a GC keeps drawing systems teams.",
      "Tooling and ergonomics have matured past the early cliff.",
      "Interop with existing C/C++ lowers the migration cost.",
    ],
    6,
    "https://www.rust-lang.org/",
  ),
  mk(
    "Global Tech News",
    "Edge Databases Blur the Client/Server Line",
    "sqlite.org",
    "Syncing SQLite-class databases to the edge and the client is making 'local-first' apps practical — instant reads, offline support, and eventual sync.",
    [
      "Local-first apps feel instant and work offline.",
      "Sync engines handle the hard conflict-resolution parts.",
      "The edge is becoming a first-class data tier.",
    ],
    6,
    "https://www.sqlite.org/",
  ),

  // ── Chapter: Podcast Notes ──────────────────────────────────────────────
  mk(
    "Podcasts",
    "Building Systems That Survive Success",
    "podcast",
    "An infra lead on scaling from ten thousand to ten million users. The recurring theme: most outages come not from load, but from operational habits a team never built while small.",
    [
      "Observability is a day-one investment, not a scale-up afterthought.",
      "Boring, well-understood technology outlasts clever bets under load.",
      "The bottleneck is usually processes, not machines.",
      "Write the runbook before you need it.",
    ],
    8,
    "https://www.youtube.com/",
  ),
  mk(
    "Podcasts",
    "How Great Teams Do Code Review",
    "podcast",
    "A conversation on review culture: fast, kind, and focused on design over nitpicks. Small PRs and clear intent do more for quality than any checklist.",
    [
      "Small, focused PRs get better reviews and merge faster.",
      "Review for design and correctness; let tools handle style.",
      "Kindness and speed compound into a healthier codebase.",
    ],
    7,
    "https://www.youtube.com/",
  ),
  mk(
    "Podcasts",
    "Career Advice for Early Developers",
    "podcast",
    "Two senior engineers on what actually moves a career: depth in fundamentals, visible impact, and the compounding value of writing things down.",
    [
      "Fundamentals age slower than frameworks — invest there.",
      "Impact you can point to beats hours you can't.",
      "Writing clarifies thinking and multiplies your reach.",
    ],
    7,
    "https://www.youtube.com/",
  ),
  mk(
    "Podcasts",
    "The Economics of Running LLMs in Production",
    "podcast",
    "A candid breakdown of what inference really costs at scale, and the levers — caching, routing to smaller models, and batching — that keep the bill sane.",
    [
      "Prompt caching and model routing cut cost dramatically.",
      "Not every request needs the biggest model.",
      "Batching and streaming shape both cost and UX.",
    ],
    7,
    "https://www.youtube.com/",
  ),
];

// helper for other months (sets a specific editionId)
const mkFor = (editionId) => (category, title, sourceName, summary, takeaways, score, url) => ({
  id: `mock-${++_n}`,
  editionId,
  url,
  sourceName,
  title,
  summary,
  takeaways,
  category,
  score,
  status: "published",
  order: _n,
});

const apr = mkFor("2026-04");
const aprilArticles = [
  apr("AI Advancement", "Fine-Tuning vs. Prompting: When Each Wins", "openai.com",
    "A practical breakdown of when a few good prompts beat fine-tuning and when the reverse is true. For most teams, prompting plus retrieval covers the ground; fine-tuning earns its keep for style and format consistency at scale.",
    ["Start with prompting + retrieval before reaching for fine-tuning.", "Fine-tuning shines for consistent tone, format, and latency.", "Measure both against the same eval set."], 8, "https://openai.com/"),
  apr("AI Advancement", "Vector Databases, Demystified", "pinecone.io",
    "What a vector database actually does, why cosine similarity matters, and how chunking strategy quietly decides retrieval quality more than the model choice.",
    ["Chunking strategy often matters more than the embedding model.", "Metadata filters keep retrieval relevant and fast.", "Recall is a tunable trade-off, not a fixed property."], 7, "https://www.pinecone.io/"),
  apr("Prod Issue", "The Deploy That Doubled the Bill", "aws.amazon.com",
    "An autoscaling misconfiguration spun up far more instances than needed and quietly tripled the monthly cloud bill before anyone noticed. Budgets and alerts, not heroics, caught it the second time.",
    ["Cost alerts belong in the same tier as uptime alerts.", "Autoscaling needs sane upper bounds.", "Tag resources so spend is traceable to a team."], 8, "https://aws.amazon.com/"),
  apr("Prod Issue", "A Memory Leak That Took a Week to Find", "nodejs.org",
    "A slow leak from an unbounded cache degraded a service over days, not minutes — the hardest kind to catch. Heap snapshots and a simple bounded LRU ended it.",
    ["Slow leaks hide because they don't page you immediately.", "Bound every cache; unbounded growth is a leak waiting to happen.", "Heap diffing over time beats guessing."], 7, "https://nodejs.org/"),
  apr("Global Tech News", "The Browser as an App Platform Grows Up", "web.dev",
    "Progressive Web Apps, offline-first storage, and native-feeling APIs keep closing the gap with installed software — good news for reach and distribution.",
    ["PWAs cut install friction while keeping native-like UX.", "Offline-first is now a realistic default.", "One codebase reaching every device is finally practical."], 6, "https://web.dev/"),
  apr("Podcasts", "Notes: The Craft of Technical Writing", "podcast",
    "A writer-engineer on why the best docs are ruthlessly reader-first: lead with the task, show a working example, and cut every sentence that doesn't help someone finish.",
    ["Lead with the reader's task, not the system's architecture.", "A runnable example is worth a page of prose.", "Editing is where clarity actually happens."], 7, "https://www.youtube.com/"),
];

const mar = mkFor("2026-03");
const marchArticles = [
  mar("AI Advancement", "Embeddings for People in a Hurry", "huggingface.co",
    "A gentle intro to what embeddings are, why 'similar things sit close together' is the whole trick, and where they quietly power search, recommendations, and RAG.",
    ["Embeddings turn meaning into geometry you can search.", "The same idea powers search, recs, and RAG.", "Good embeddings make simple systems feel smart."], 7, "https://huggingface.co/"),
  mar("Prod Issue", "The Off-By-One That Corrupted a Report", "postgresql.org",
    "An inclusive/exclusive date-range bug double-counted a day at every month boundary, subtly inflating a dashboard for months. Property tests on the boundaries closed it for good.",
    ["Boundary bugs hide in plain sight for a long time.", "Test the edges explicitly, not just the happy path.", "Dashboards need correctness tests too."], 7, "https://www.postgresql.org/"),
  mar("Global Tech News", "Why Everyone's Talking About Local-First", "inkandswitch.com",
    "Local-first software promises the responsiveness of local apps with the sync of the cloud — a direction that could reshape how collaborative tools are built.",
    ["Local-first apps stay fast and work offline.", "CRDTs make conflict-free sync tractable.", "The model challenges cloud-only assumptions."], 6, "https://www.inkandswitch.com/"),
  mar("Global Tech News", "Containers, Ten Years On", "docker.com",
    "A look back at how containers reshaped deployment, and where the ecosystem is heading next as orchestration matures and edges toward simplicity again.",
    ["Containers standardized 'works on my machine' away.", "Orchestration is powerful but often over-adopted.", "The trend is back toward operational simplicity."], 6, "https://www.docker.com/"),
  mar("Podcasts", "Notes: Debugging as a Discipline", "podcast",
    "A senior engineer on treating debugging as science: form a hypothesis, change one thing, and let the system tell you where you're wrong.",
    ["Change one variable at a time under a clear hypothesis.", "The bug is rarely where your ego expects it.", "Reproduce first; fix second."], 7, "https://www.youtube.com/"),
];

const mockReads = [
  {
    edition: {
      id: "2026-05",
      title: "May 2026 — The Data Questers Reader",
      subtitle: "What mattered this month, curated by hand and drafted by an agent.",
      status: "published",
      publishedAt: new Date("2026-05-31T12:00:00+05:30").getTime(),
    },
    articles,
  },
  {
    edition: {
      id: "2026-04",
      title: "April 2026 — The Data Questers Reader",
      subtitle: "Prompts, postmortems, and the browser growing up.",
      status: "published",
      publishedAt: new Date("2026-04-30T12:00:00+05:30").getTime(),
    },
    articles: aprilArticles,
  },
  {
    edition: {
      id: "2026-03",
      title: "March 2026 — The Data Questers Reader",
      subtitle: "Embeddings, edge cases, and a look back at containers.",
      status: "published",
      publishedAt: new Date("2026-03-31T12:00:00+05:30").getTime(),
    },
    articles: marchArticles,
  },
];

export default mockReads;
