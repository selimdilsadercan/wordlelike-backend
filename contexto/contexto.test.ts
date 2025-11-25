import { describe, it, expect } from "vitest";
import {
  saveContextoWord,
  getContextoWordByDay,
  updateByDay,
  deleteByDay,
} from "./contexto";

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

  it("should update contexto words using updateByDay", async () => {
    const initialWords = [
      {
        rank: 1,
        word: "initial",
        similarity: 1.0,
      },
    ];

    const updatedWords = [
      {
        rank: 1,
        word: "updated",
        similarity: 0.95,
      },
    ];

    // First save the words
    await saveContextoWord({
      date: "25.11.2025",
      words: initialWords,
    });

    // Update using updateByDay
    const updateResult = await updateByDay({
      date: "25.11.2025",
      words: updatedWords,
    });

    expect(updateResult.success).toBe(true);

    // Verify the update
    const result = await getContextoWordByDay({ date: "25.11.2025" });
    expect(result.words[0].word).toBe("updated");
    expect(result.words[0].similarity).toBe(0.95);
  });

  it("should throw error when updating non-existent date", async () => {
    await expect(
      updateByDay({
        date: "99.99.9999",
        words: [],
      })
    ).rejects.toThrow();
  });

  it("should delete contexto words using deleteByDay", async () => {
    // First save some words
    await saveContextoWord({
      date: "26.11.2025",
      words: testWords,
    });

    // Verify they exist
    const beforeDelete = await getContextoWordByDay({ date: "26.11.2025" });
    expect(beforeDelete.words).toHaveLength(2);

    // Delete them
    const deleteResult = await deleteByDay({ date: "26.11.2025" });
    expect(deleteResult.success).toBe(true);

    // Verify they are deleted
    await expect(
      getContextoWordByDay({ date: "26.11.2025" })
    ).rejects.toThrow();
  });

  it("should throw error when deleting non-existent date", async () => {
    await expect(deleteByDay({ date: "99.99.9999" })).rejects.toThrow();
  });
});
