import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InviteTicket, type TicketData } from "./invite-ticket";

vi.mock("@/lib/gamification/share", () => ({ shareToTelegram: vi.fn(async () => "link") }));
vi.mock("./gamification/share-card", () => ({ pageFonts: () => ({ sans: "sans", display: "sans" }) }));

const t: TicketData = { name: "رقبای جمعه", code: "sun9k", link: "t.me/luckyfan_bot?start=sun9k", match: "لیورپول - منچسترسیتی", entry: 1500, perCall: null, cap: 2500, slots: 3, joined: 0 };

describe("InviteTicket", () => {
  it("shows the league and its link, and sends itself to Telegram", async () => {
    const { shareToTelegram } = await import("@/lib/gamification/share");
    render(<InviteTicket t={t} />);
    expect(screen.getByText("رقبای جمعه")).toBeInTheDocument();
    expect(screen.getByText(t.link)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /تلگرام/ }));
    await waitFor(() => expect(shareToTelegram).toHaveBeenCalledWith(expect.objectContaining({ url: `https://${t.link}` })));
    expect(await screen.findByText("رفت")).toBeInTheDocument();
  });

  it("is stamped once the league exists", () => {
    render(<InviteTicket t={t} created />);
    expect(screen.getByRole("status")).toHaveTextContent("ساخته شد");
  });
});
