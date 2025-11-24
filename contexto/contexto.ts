import { api, APIError } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";

// 'contexto' database is used to store contexto words by date.
const db = new SQLDatabase("contexto", { migrations: "./migrations" });

interface ContextoWord {
  rank: number;
  word: string;
  similarity: number;
}

interface SaveContextoWordParams {
  date: string; // Date in format "DD.MM.YYYY" or "YYYY-MM-DD"
  words: ContextoWord[]; // Array of contexto words
}

interface GetContextoWordByDayResponse {
  date: string;
  words: ContextoWord[];
}

// saveContextoWord saves contexto words for a specific day.
export const saveContextoWord = api(
  { expose: true, auth: false, method: "POST", path: "/contexto/save" },
  async ({
    date,
    words,
  }: SaveContextoWordParams): Promise<{ success: boolean }> => {
    // Parse the date string to ensure it's in the correct format
    const parsedDate = parseDate(date);

    // Convert words array to JSON string
    const wordsJSON = JSON.stringify(words);

    // Insert or update the contexto words for this date
    await db.exec`
      INSERT INTO contexto_words (date, words)
      VALUES (${parsedDate}, ${wordsJSON}::jsonb)
      ON CONFLICT (date) 
      DO UPDATE SET words = EXCLUDED.words, created_at = CURRENT_TIMESTAMP
    `;

    return { success: true };
  }
);

// getContextoWordByDay retrieves contexto words for a specific day.
export const getContextoWordByDay = api(
  { expose: true, auth: false, method: "GET", path: "/contexto/:date" },
  async ({ date }: { date: string }): Promise<GetContextoWordByDayResponse> => {
    const parsedDate = parseDate(date);

    const row = await db.queryRow`
      SELECT words
      FROM contexto_words
      WHERE date = ${parsedDate}
    `;

    if (!row) {
      throw APIError.notFound(`contexto words not found for date: ${date}`);
    }

    // Parse the JSONB column back to array
    // Encore's SQLDatabase automatically parses JSONB, but we ensure it's an array
    const words: ContextoWord[] =
      typeof row.words === "string"
        ? JSON.parse(row.words)
        : (row.words as ContextoWord[]);

    return {
      date,
      words,
    };
  }
);

// parseDate converts date string to Date object or ISO string format
function parseDate(dateStr: string): string {
  // Try DD.MM.YYYY format first (like "23.11.2025")
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }

  // Try YYYY-MM-DD format (already correct)
  const yyyymmddMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (yyyymmddMatch) {
    return dateStr;
  }

  // If neither format matches, throw an error
  throw APIError.invalidArgument(
    `Invalid date format: ${dateStr}. Expected format: DD.MM.YYYY or YYYY-MM-DD`
  );
}
