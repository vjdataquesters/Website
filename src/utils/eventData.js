/**
 * Helpers to normalize legacy event data and derive display sections dynamically.
 * Original event data in events.js is never modified — parsing happens at render time.
 */

const RANK_HEADER = /\b(1st|2nd|3rd|4th|5th|\d+(?:st|nd|rd|th))\b/i;

const POSITION_PATTERNS = [
  { regex: /1st|first|winner(?!\s*runner)/i, position: 1 },
  { regex: /2nd|second|1st\s*runner/i, position: 2 },
  { regex: /3rd|third|2nd\s*runner/i, position: 3 },
  { regex: /4th|fourth/i, position: 4 },
  { regex: /5th|fifth/i, position: 5 },
];

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(b|strong|i|em|p|span)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseWinnerBlock(header, body, index) {
  const trimmedHeader = header.trim();
  if (!trimmedHeader) return null;

  const isRank = RANK_HEADER.test(trimmedHeader);
  const dashSplit = trimmedHeader.match(/^(.+?)\s[-–—]\s(.+)$/);

  if (dashSplit && !isRank) {
    return {
      position: index + 1,
      category: dashSplit[1].trim(),
      title: dashSplit[2].trim(),
      members: body || undefined,
      type: "category",
      rawHeader: trimmedHeader,
    };
  }

  if (dashSplit && isRank) {
    let position = index + 1;
    for (const { regex, position: pos } of POSITION_PATTERNS) {
      if (regex.test(dashSplit[1])) {
        position = pos;
        break;
      }
    }
    const numMatch = dashSplit[1].match(/\b(\d)(?:st|nd|rd|th)\b/i);
    if (numMatch) position = parseInt(numMatch[1], 10);

    return {
      position,
      title: dashSplit[2].trim(),
      members: body || undefined,
      type: "rank",
      rawHeader: trimmedHeader,
    };
  }

  let position = index + 1;
  for (const { regex, position: pos } of POSITION_PATTERNS) {
    if (regex.test(trimmedHeader)) {
      position = pos;
      break;
    }
  }

  const numMatch = trimmedHeader.match(/\b(\d)(?:st|nd|rd|th)\b/i);
  if (numMatch) position = parseInt(numMatch[1], 10);

  const strippedTitle = trimmedHeader
    .replace(/^[\d]+(?:st|nd|rd|th)?\s*(place|prize|position)?\s*[-:]?\s*/i, "")
    .trim();

  // Header is only a rank label — winner name lives in the body
  if (isRank && !strippedTitle && body) {
    const bodyLines = body.split("\n").map((l) => l.trim()).filter(Boolean);
    return {
      position,
      title: bodyLines[0],
      members: bodyLines.length > 1 ? bodyLines.slice(1).join("\n") : undefined,
      type: "rank",
      rawHeader: trimmedHeader,
    };
  }

  return {
    position,
    title: strippedTitle || body?.split("\n")[0]?.trim() || `Rank ${position}`,
    members:
      strippedTitle && body
        ? body
        : body?.includes("\n")
          ? body.split("\n").slice(1).join("\n")
          : undefined,
    type: "rank",
    rawHeader: trimmedHeader,
  };
}

export function parseWinnersFromHtml(winnersHtml) {
  if (!winnersHtml) return [];

  const html = winnersHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>");

  const boldBlockRegex = /<b>([^<]*)<\/b>\s*([\s\S]*?)(?=<b>|$)/gi;
  const matches = [...html.matchAll(boldBlockRegex)];

  if (matches.length > 0) {
    const results = [];
    matches.forEach((match, index) => {
      const header = stripHtml(match[1]);
      const body = stripHtml(match[2]).trim();
      const parsed = parseWinnerBlock(header, body, index);
      if (parsed) results.push(parsed);
    });
    if (results.length) return results.sort((a, b) => a.position - b.position);
  }

  // Fallback for formats without <b> tags
  const normalized = winnersHtml
    .replace(/<br\s*\/?>/gi, "<br>")
    .replace(/<\/b><br><br>/gi, "</BLOCK>")
    .replace(/<\/strong><br><br>/gi, "</BLOCK>");

  const blocks = normalized.split("</BLOCK>").map((b) => stripHtml(b));
  const results = [];

  blocks.forEach((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    const header = lines[0] || "";
    const body = lines.slice(1).join("\n");
    const parsed = parseWinnerBlock(header, body, index);
    if (parsed) results.push(parsed);
  });

  return results.sort((a, b) => a.position - b.position);
}

export function getWinnerRankings(event) {
  if (event.winnerRankings?.length) {
    return event.winnerRankings.map((w) => ({ ...w, type: w.type || "rank" }));
  }
  if (event.winners) return parseWinnersFromHtml(event.winners);
  return [];
}

export function getWinnerDisplayMode(winners) {
  if (!winners.length) return "none";

  const categoryCount = winners.filter((w) => w.type === "category").length;
  const rankCount = winners.filter(
    (w) => w.type === "rank" || RANK_HEADER.test(w.rawHeader || w.title || ""),
  ).length;

  if (categoryCount > 0 && rankCount === 0) return "category-grid";
  if (rankCount >= 2 && categoryCount === 0) return "podium";
  if (rankCount > 0) return "rank-grid";
  return "category-grid";
}

export function parseOutcomesFromText(outcomeText) {
  if (!outcomeText) return [];

  const cleaned = stripHtml(outcomeText);
  const bulletParts = cleaned.split(/(?:^|\n)\s*[●•]\s+/).filter((p) => p.trim());

  if (bulletParts.length > 1) {
    return bulletParts.map((part, i) => {
      const lines = part.trim().split("\n");
      const titleLine = lines[0];
      const colonIdx = titleLine.indexOf(":");
      if (colonIdx > 0 && colonIdx < 60) {
        return {
          title: titleLine.slice(0, colonIdx).trim(),
          description: (
            titleLine.slice(colonIdx + 1).trim() +
            "\n" +
            lines.slice(1).join("\n")
          ).trim(),
        };
      }
      return {
        title: `Key Takeaway ${i + 1}`,
        description: part.trim(),
      };
    });
  }

  const strongParts = cleaned
    .split(/\n(?=[A-Z<])/)
    .filter((p) => p.trim().length > 20);

  if (strongParts.length > 1) {
    return strongParts.map((part, i) => {
      const firstLine = part.split("\n")[0];
      return {
        title: firstLine.length < 80 ? firstLine : `Highlight ${i + 1}`,
        description:
          firstLine.length < 80
            ? part.split("\n").slice(1).join("\n").trim() || part.trim()
            : part.trim(),
      };
    });
  }

  return [{ description: cleaned }];
}

export function getOutcomes(event) {
  if (event.outcomes?.length) {
    return {
      items: event.outcomes,
      layout: event.outcomes.length === 1 ? "prose" : "grid",
    };
  }

  if (event.outcome) {
    const parsed = parseOutcomesFromText(event.outcome);
    if (parsed.length === 1 && !parsed[0].title) {
      return { items: parsed, layout: "prose" };
    }
    if (parsed.length === 1) {
      return { items: parsed, layout: "prose" };
    }
    return { items: parsed, layout: "grid" };
  }

  return { items: [], layout: "grid" };
}

export function getHighlights(event) {
  if (event.highlights?.length) return event.highlights;

  const allTags = event.event_tags || (event.category ? [event.category] : []);

  return allTags.map((tag) => ({
    title: tag,
    icon: inferIconFromTag(tag),
  }));
}

function inferIconFromTag(tag) {
  const t = tag.toLowerCase();
  if (t.includes("hackathon") || t.includes("coding")) return "code";
  if (t.includes("workshop")) return "wrench";
  if (t.includes("guest") || t.includes("speaker")) return "mic";
  if (t.includes("data")) return "chart";
  if (t.includes("cloud") || t.includes("aws")) return "cloud";
  if (t.includes("fun") || t.includes("treasure")) return "sparkles";
  if (t.includes("competition") || t.includes("contest")) return "trophy";
  if (t.includes("ai") || t.includes("llm") || t.includes("machine")) return "brain";
  return "star";
}

export function extractParticipantCount(event) {
  if (event.participantCount) return event.participantCount;

  const sources = [event.outcome, event.winners].filter(Boolean);
  for (const src of sources) {
    const match =
      src.match(/participat(?:ed|ion|ing)?[^<]*<b>\s*(\d+)\s*<\/b>/i) ||
      src.match(/participat(?:ed|ion|ing)?\s*[:]\s*(\d+)/i) ||
      src.match(/registrations?\s*[^<]*<b>\s*(\d+)\s*<\/b>/i);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

export function getRegistrationStatus(event, isUpcoming) {
  if (event.registrationStatus) return event.registrationStatus;
  if (isUpcoming && event.register) return "open";
  if (event.register && !isUpcoming) return "closed";
  return isUpcoming ? "upcoming" : "closed";
}

export function getEventType(event) {
  if (event.eventType) return event.eventType;
  if (event.event_tags?.length) return event.event_tags[0];
  if (event.category) return event.category;
  return "Event";
}

export function deriveStats(event) {
  if (event.stats?.length) return event.stats;

  const stats = [];
  const participants = extractParticipantCount(event);

  if (participants) {
    stats.push({ label: "Participants", value: participants, icon: "users" });
  }

  if (event.speakers?.length) {
    stats.push({ label: "Speakers", value: event.speakers.length, icon: "mic" });
  }

  if (event.timeline?.length) {
    stats.push({ label: "Days", value: event.timeline.length, icon: "calendar" });
    const sessionCount = event.timeline.reduce(
      (acc, day) => acc + (day.items?.length || day.sessions?.length || 0),
      0,
    );
    if (sessionCount > 0) {
      stats.push({ label: "Sessions", value: sessionCount, icon: "layers" });
    }
  }

  if (event.pics?.length) {
    stats.push({ label: "Photos", value: event.pics.length, icon: "image" });
  }

  if (event.externalDownloads) {
    stats.push({
      label: "Resources",
      value: Object.keys(event.externalDownloads).length,
      icon: "file",
    });
  }

  const winners = getWinnerRankings(event);
  if (winners.length) {
    stats.push({ label: "Winners", value: winners.length, icon: "trophy" });
  }

  if (event.timings) {
    stats.push({ label: "Duration", value: event.timings, icon: "clock", isText: true });
  }

  return stats;
}

export function getCoverImage(event) {
  return event.coverImage || event.image || event.pics?.[0] || null;
}

export function getResourceItems(event) {
  if (event.resources?.length) return event.resources;

  if (!event.externalDownloads) return [];

  return Object.entries(event.externalDownloads).map(([title, url]) => ({
    title,
    url,
    description: inferResourceDescription(url),
    type: inferResourceType(url),
  }));
}

function inferResourceType(url) {
  if (url.endsWith(".zip")) return "archive";
  if (url.endsWith(".pdf")) return "pdf";
  if (url.includes("github.com")) return "code";
  if (url.endsWith(".ipynb")) return "notebook";
  return "file";
}

function inferResourceDescription(url) {
  if (url.endsWith(".zip")) return "Downloadable project archive";
  if (url.endsWith(".pdf")) return "PDF guide and reference material";
  if (url.includes("github.com")) return "Source code repository";
  if (url.endsWith(".ipynb")) return "Interactive notebook material";
  return "Event resource material";
}

export function buildNavSections(event, derived) {
  const sections = [{ id: "about", label: "About" }];

  if (derived.highlights.length) sections.push({ id: "highlights", label: "Highlights" });
  if (event.timeline?.length) sections.push({ id: "timeline", label: "Timeline" });
  if (event.pics?.length) sections.push({ id: "gallery", label: "Gallery" });
  if (derived.outcomes.length) sections.push({ id: "outcomes", label: "Outcomes" });
  if (derived.winners.length) sections.push({ id: "winners", label: "Results" });
  if (derived.resources.length) sections.push({ id: "resources", label: "Resources" });
  if (derived.stats.length) sections.push({ id: "stats", label: "Stats" });

  return sections;
}
