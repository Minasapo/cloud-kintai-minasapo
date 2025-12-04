import dayjs, { Dayjs } from "dayjs";

type DateCandidate = Dayjs | string | null | undefined;

const toDayjsOrNull = (candidate: DateCandidate): Dayjs | null => {
  if (!candidate) return null;
  if (dayjs.isDayjs(candidate)) return candidate;
  const parsed = dayjs(candidate);
  return parsed.isValid() ? parsed : null;
};

export function resolveConfigTimeOnDate(
  configTime: Dayjs,
  ...dateCandidates: DateCandidate[]
): string {
  const baseDate =
    dateCandidates
      .map((candidate) => toDayjsOrNull(candidate))
      .find((candidate): candidate is Dayjs => Boolean(candidate)) ??
    dayjs();

  return baseDate
    .hour(configTime.hour())
    .minute(configTime.minute())
    .second(configTime.second())
    .millisecond(configTime.millisecond())
    .toISOString();
}
