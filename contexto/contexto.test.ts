import { describe, it, expect } from "vitest";
import { saveContextoWord, getContextoWordByDay } from "./contexto";

describe("contexto service", () => {
  const testDate = "23.11.2025";
  const testWords = [
    {
      rank: 1,
      word: "gemi",
      similarity: 1.0,
    },
    {
      rank: 2,
      word: "tekne",
      similarity: 0.8132,
    },
  ];

  it("should save contexto words", async () => {
    const saveResult = await saveContextoWord({
      date: testDate,
      words: testWords,
    });

    expect(saveResult.success).toBe(true);
  });

  it("should retrieve contexto words by date", async () => {
    // First save the words
    await saveContextoWord({
      date: testDate,
      words: testWords,
    });

    // Then retrieve them
    const result = await getContextoWordByDay({ date: testDate });

    expect(result.date).toBe(testDate);
    expect(result.words).toHaveLength(2);
    expect(result.words[0].word).toBe("gemi");
    expect(result.words[0].rank).toBe(1);
    expect(result.words[1].word).toBe("tekne");
    expect(result.words[1].rank).toBe(2);
  });

  it("should handle invalid date format", async () => {
    await expect(
      saveContextoWord({
        date: "invalid-date",
        words: [],
      })
    ).rejects.toThrow();
  });

  it("should return not found for non-existent date", async () => {
    await expect(
      getContextoWordByDay({ date: "01.01.2000" })
    ).rejects.toThrow();
  });

  it("should update existing contexto words for the same date", async () => {
    const initialWords = [
      {
        rank: 1,
        word: "test1",
        similarity: 1.0,
      },
    ];

    const updatedWords = [
      {
        rank: 1,
        word: "test2",
        similarity: 0.9,
      },
    ];

    // Save initial words
    await saveContextoWord({
      date: "24.11.2025",
      words: initialWords,
    });

    // Update with new words
    await saveContextoWord({
      date: "24.11.2025",
      words: updatedWords,
    });

    // Retrieve and verify update
    const result = await getContextoWordByDay({ date: "24.11.2025" });
    expect(result.words[0].word).toBe("test2");
  });
});
