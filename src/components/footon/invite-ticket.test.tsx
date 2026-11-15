import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InviteTicket, type TicketData } from "./invite-ticket";

const t: TicketData = { name: "رقبای جمعه", code: "sun9k", link: "t.me/luckyfan_bot?start=sun9k", match: "لیورپول - منچسترسیتی", entry: 1500, perCall: null, cap: 2500, slots: 3, joined: 0 };

describe("InviteTicket", () => {
  it("shows the league, the link and copies on tap", async () => {
    const onCopy = vi.fn();
    render(<InviteTicket t={t} onCopy={onCopy} />);
    expect(screen.getByText("رقبای جمعه")).toBeInTheDocument();
    expect(screen.getByText(t.link)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "کپی لینک دعوت" }));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("is stamped once the league exists", () => {
    render(<InviteTicket t={t} created copied />);
    expect(screen.getByRole("status")).toHaveTextContent("ساخته شد");
    expect(screen.getByRole("button", { name: "لینک دعوت کپی شد" })).toBeInTheDocument();
  });
});
