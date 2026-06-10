import {
  buildDuplicateInfoByStaff,
  mergeDuplicateAttendances,
  parseDuplicateListFromError,
} from "../duplicateAttendanceUtils";

describe("duplicateAttendanceUtils", () => {
  describe("parseDuplicateListFromError", () => {
    it("extracts duplicates from error details", () => {
      const error = {
        details: {
          duplicates: [
            {
              workDate: "2024-01-15",
              ids: ["att-1", "att-2"],
              staffId: "staff-1",
            },
          ],
        },
      };

      const result = parseDuplicateListFromError(error, "staff-1", {
        "staff-1": "山田 太郎",
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        staffId: "staff-1",
        staffName: "山田 太郎",
        workDate: "2024-01-15",
        ids: ["att-1", "att-2"],
      });
    });

    it("returns empty array for invalid details", () => {
      const result = parseDuplicateListFromError(
        { details: { duplicates: "invalid" } },
        "staff-1",
        {},
      );

      expect(result).toEqual([]);
    });

    it("filters invalid duplicate entries and one-id records", () => {
      const error = {
        details: {
          duplicates: [
            null,
            { workDate: "2024-01-15", ids: ["only-one"] },
            { workDate: "2024-01-15", ids: ["att-1", "att-2"] },
          ],
        },
      };

      const result = parseDuplicateListFromError(error, "staff-1", {});

      expect(result).toHaveLength(1);
      expect(result[0].staffId).toBe("staff-1");
    });
  });

  describe("mergeDuplicateAttendances", () => {
    const sample = {
      staffId: "staff-1",
      staffName: "山田 太郎",
      workDate: "2024-01-15",
      ids: ["att-1", "att-2"],
    };

    it("returns empty when loading is true", () => {
      const result = mergeDuplicateAttendances([sample], [sample], true);
      expect(result).toEqual([]);
    });

    it("deduplicates by staff/date/ids key", () => {
      const result = mergeDuplicateAttendances([sample], [sample], false);
      expect(result).toHaveLength(1);
    });
  });

  describe("buildDuplicateInfoByStaff", () => {
    it("groups duplicates by staffId", () => {
      const result = buildDuplicateInfoByStaff([
        {
          staffId: "staff-1",
          staffName: "山田 太郎",
          workDate: "2024-01-15",
          ids: ["att-1", "att-2"],
        },
        {
          staffId: "staff-2",
          staffName: "佐藤 花子",
          workDate: "2024-01-16",
          ids: ["att-3", "att-4"],
        },
      ]);

      expect(result["staff-1"]).toHaveLength(1);
      expect(result["staff-2"]).toHaveLength(1);
    });
  });
});
