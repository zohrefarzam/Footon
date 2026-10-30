"use client";

import { useState } from "react";

import { SegmentedTabs } from "./segmented-tabs";

const filters = ["Now", "Today", "Upcoming"] as const;
type Filter = (typeof filters)[number];

export function MatchFilter() {
  const [value, setValue] = useState<Filter>("Now");
  return <SegmentedTabs label="Match filter" options={filters} value={value} onValueChange={setValue} />;
}
