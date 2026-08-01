export const COLOR_SOFT = [
  {
    key: "blue",
    bgColor: "oklch(95% 0.03 243.15)",
    textColor: "oklch(45% 0.14 243.15)",
  },
  {
    key: "green",
    bgColor: "oklch(96% 0.04 142.00)",
    textColor: "oklch(43% 0.12 142.00)",
  },
  {
    key: "amber",
    bgColor: "oklch(96% 0.04 70.00)",
    textColor: "oklch(47% 0.13 70.00)",
  },
  {
    key: "rose",
    bgColor: "oklch(95% 0.04 15.00)",
    textColor: "oklch(45% 0.14 15.00)",
  },
  {
    key: "purple",
    bgColor: "oklch(95% 0.04 295.00)",
    textColor: "oklch(45% 0.14 295.00)",
  },
  // New Color
  {
    key: "teal",
    bgColor: "oklch(95% 0.03 190.00)",
    textColor: "oklch(44% 0.12 190.00)",
  },
  {
    key: "indigo",
    bgColor: "oklch(95% 0.04 270.00)",
    textColor: "oklch(45% 0.14 270.00)",
  },
  {
    key: "pink",
    bgColor: "oklch(95% 0.04 345.00)",
    textColor: "oklch(46% 0.14 345.00)",
  },
  {
    key: "mint",
    bgColor: "oklch(96% 0.03 165.00)",
    textColor: "oklch(43% 0.12 165.00)",
  },
  {
    key: "sky",
    bgColor: "oklch(95% 0.03 215.00)",
    textColor: "oklch(45% 0.13 215.00)",
  },
  {
    key: "coral",
    bgColor: "oklch(95% 0.04 35.00)",
    textColor: "oklch(46% 0.14 35.00)",
  },
  {
    key: "violet",
    bgColor: "oklch(95% 0.04 320.00)",
    textColor: "oklch(45% 0.14 320.00)",
  },
  {
    key: "lime",
    bgColor: "oklch(96% 0.04 125.00)",
    textColor: "oklch(43% 0.13 125.00)",
  },
  {
    key: "slate",
    bgColor: "oklch(95% 0.015 240.00)",
    textColor: "oklch(45% 0.06 240.00)",
  },
  {
    key: "sand",
    bgColor: "oklch(96% 0.025 85.00)",
    textColor: "oklch(46% 0.09 85.00)",
  },
] as const;

export const getColorMap = Object.fromEntries(
  COLOR_SOFT.map((c) => [c.key, c]),
);
