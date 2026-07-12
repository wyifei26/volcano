import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const generatedDir = path.join(root, "src", "data", "generated");

const volumePattern = /^第[零一二三四五六七八九十百千万0-9]+卷(?:\s|$).*$/;
const chapterPattern = /^(楔子(?:\s|$).*|第[零一二三四五六七八九十百千万0-9]+章(?:\s|$).*)$/;

function countText(text) {
  return [...text.replace(/\s/g, "")].length;
}

function makeExcerpt(lines) {
  const first = lines.find((line) => line.trim().length > 0)?.trim() ?? "";
  return first.length > 88 ? `${first.slice(0, 88)}...` : first;
}

function getSerialUpdateDate(sourceFile) {
  const match = sourceFile.match(/^火山劫-(\d{4})(\d{2})(\d{2})\.txt$/);
  if (!match) return null;

  const [, year, month, day] = match;
  return {
    value: `${year}-${month}-${day}`,
    label: `${year}年${Number(month)}月${Number(day)}日`
  };
}

function parseNovel(raw, sourceFile) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const chapters = [];
  let currentVolume = "未分卷";
  let volumeIndex = 0;
  let current = null;

  function closeCurrent() {
    if (!current) return;
    current.content = current.lines.join("\n").trimEnd();
    current.paragraphs = current.lines
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0);
    current.wordCount = countText(current.content);
    current.excerpt = makeExcerpt(current.lines);
    delete current.lines;
    chapters.push(current);
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (volumePattern.test(line)) {
      closeCurrent();
      volumeIndex += 1;
      currentVolume = line;
      current = null;
      continue;
    }

    if (chapterPattern.test(line)) {
      closeCurrent();
      current = {
        title: line,
        volume: currentVolume,
        volumeIndex,
        order: chapters.length,
        sourceFile,
        lines: []
      };
      continue;
    }

    if (current) {
      current.lines.push(rawLine);
    }
  }

  closeCurrent();

  const usedSlugs = new Map();
  for (const chapter of chapters) {
    const baseSlug = chapter.title.startsWith("楔子")
      ? `v${chapter.volumeIndex || 1}-prologue`
      : `v${chapter.volumeIndex || 1}-ch-${String(chapter.order).padStart(3, "0")}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    chapter.slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  }

  return chapters.map((chapter, index) => ({
    ...chapter,
    previousSlug: chapters[index - 1]?.slug ?? null,
    nextSlug: chapters[index + 1]?.slug ?? null
  }));
}

async function findLatestManuscript() {
  const files = await readdir(root);
  const manuscripts = files
    .filter((file) => /^火山劫-\d{8}\.txt$/.test(file))
    .sort((a, b) => b.localeCompare(a));

  if (manuscripts.length === 0) {
    throw new Error("未找到形如 火山劫-YYYYMMDD.txt 的原稿文件。");
  }

  return manuscripts[0];
}

const manuscriptFile = process.argv[2] ?? (await findLatestManuscript());
const manuscriptPath = path.join(root, manuscriptFile);
const raw = await readFile(manuscriptPath, "utf8");
const chapters = parseNovel(raw, manuscriptFile);
const serialUpdateDate = getSerialUpdateDate(manuscriptFile);

await mkdir(generatedDir, { recursive: true });
await writeFile(
  path.join(generatedDir, "chapters.json"),
  `${JSON.stringify(
    {
      sourceFile: manuscriptFile,
      serialUpdatedAt: serialUpdateDate?.value ?? null,
      serialUpdatedLabel: serialUpdateDate?.label ?? null,
      importedAt: new Date().toISOString(),
      chapterCount: chapters.length,
      totalWordCount: chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0),
      chapters
    },
    null,
    2
  )}\n`
);

console.log(`Imported ${chapters.length} chapters from ${manuscriptFile}.`);
