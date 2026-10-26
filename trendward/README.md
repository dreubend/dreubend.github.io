# Trendward public dashboard v10

This build makes the four subscription routes meaningfully different.

## Market Pulse
The Small-cap momentum, Liquidity pulse, Scanner breadth, and Risk state boxes
were removed from the top of every page. They now live inside Market Pulse.

## Tier experiences
- Free: concise daily snapshot, one featured setup, limited journey.
- Basic: active scanner workspace with up to 4 setups and 5-minute model context.
- Pro: historical intelligence with up to 8 setups, full 5-minute Model Journey,
  and 15/30/60-minute resolved outcome context.
- Premium: deepest 11-setup research experience with a compact 1-minute evidence layer.

## Visual intelligence
Added setup-strength rings, horizontal strength bars, setup heat tiles, sparkline
evidence views, journey-stage visuals, signal visualizations, and tier feature pills.

## Live-data readiness
The tier visuals listen for the `trendward:data` event emitted after the public
customer-safe snapshot is loaded, so the same visual layer can be driven by live
approved data next.
