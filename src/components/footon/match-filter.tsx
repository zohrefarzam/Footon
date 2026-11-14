"use client";

import { useState } from "react";

import { SegmentedTabs } from "./segmented-tabs";

const filters = ["الان", "امروز", "پیش رو"] as const;
type Filter = (typeof filters)[number];

export function MatchFilter() {
  const [value, setValue] = useState<Filter>("الان");
  return <SegmentedTabs label="فیلتر بازی‌ها" options={filters} value={value} onValueChange={setValue} />;
}
