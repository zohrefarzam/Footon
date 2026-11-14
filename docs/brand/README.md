# Lucky Fan («لاکی فن») brand mark

**Winky**: a football that winks, with a lucky four-leaf clover sprouting on its head. Football + luck in one
character, drawn as a cartoon sticker (flat colours, a thick ink outline, a white sticker border) so it reads on the
app's dark stadium-green ground and on light paper alike.

Made with the `logo-design` skill (`.claude/skills/logo-design`): concepts A (Winky), B («ل» catches the ball) and
C (clover heart) were compared; A was chosen. The in-app version is the React component
`src/components/footon/winky.tsx` (same geometry, animatable parts); the splash animates it.

## Files

| File | Use |
| --- | --- |
| `winky.svg` | The master symbol, full colour. Any size from 48 px up |
| `winky-small.svg` | Small-size cut for 16–48 px: one pentagon, bold eyes and grin, a four-circle clover, no seams |
| `lucky-fan-horizontal.svg` / `-on-light.svg` | Symbol + «لاکی فن», side by side (symbol at the start, on the right). White name for dark grounds / ink name for light |
| `lucky-fan-stacked.svg` / `-on-light.svg` | Symbol above the name, for square spaces |
| `winky-one-colour.svg` | Black line art on white: print, stamps, embroidery, fax-quality |
| `app-icon.svg` | Full mark on the stadium-green tile (square; the OS rounds it). Source of `src/app/apple-icon.png` |
| `favicon.svg` | Small cut on a rounded tile. Copied to `src/app/icon.svg` |

The name «لاکی فن» is Yekan Bakh Black (Fontiran, licensed), shaped with HarfBuzz and converted to outlines, so the
files carry no live text.

## Colour

| Role | HEX | Where |
| --- | --- | --- |
| Ink | `#04170E` | Outline, eyes, mouth, panels |
| Ball | `#F3F8F4`, shade `#C9D4CE` | The ball and its lower-right shading |
| Sticker | `#FFFFFF` | The border round the whole mark |
| Clover | `#43B883`, shade `#2E8F63` | The leaves and stem (the app's primary green) |
| Amber | `#FFA83E` | Cheeks and tongue (the app's live/boost amber) |
| Ground | `#06140F` | The app background and the icon tile |

## Use it well

- **Clear space**: keep at least the clover's width (about 1/6 of the symbol) clear on every side.
- **Minimum size**: full mark 48 px; below that use `winky-small.svg`.
- **Backgrounds**: the sticker border makes the colour mark work on any ground; prefer the stadium green. On light
  grounds use the `-on-light` lockups (ink name).
- **The name** always sits at the start of the symbol in right-to-left order (symbol on the right), or under it.

## Don't

- Recolour the ball, the clover or the outline, or drop the sticker border on dark grounds.
- Mirror Winky (the wink is on the viewer's right) or stretch it.
- Add effects: gradients, glows, bevels. Drop shadow only on the splash.
- Set the name in another typeface or with letter-spacing.
- Use the library logos in `.claude/skills/logo-design/assets/library` (local only) as anything but study.

## Before launch

A professional trademark search for "Lucky Fan" / «لاکی فن» and the mascot is still to be done.
