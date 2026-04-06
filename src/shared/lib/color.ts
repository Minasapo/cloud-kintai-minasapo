const normalizeHex = (value: string) => {
  const trimmed = value.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;

  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  return hex;
};

const clampByte = (value: number) =>
  Math.max(0, Math.min(255, Math.round(value)));

export function alphaColor(color: string, alpha: number) {
  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${alpha})`);
  }

  if (color.startsWith("rgba(")) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }

  const normalized = normalizeHex(color);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return color;
  }

  const red = clampByte(parseInt(normalized.slice(0, 2), 16));
  const green = clampByte(parseInt(normalized.slice(2, 4), 16));
  const blue = clampByte(parseInt(normalized.slice(4, 6), 16));

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
