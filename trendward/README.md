# Trendward public dashboard v9

Cumulative build:
- Separate Free / Basic / Pro / Premium routes
- Native links / right-click / new-tab support
- Robust hash startup routing
- Customer-safe data-feed foundation
- Responsive off-canvas sidebar
- Narrow-window fixed hamburger

## v9 narrow-window fix
At <= 700px the hamburger is detached from the header flex layout and fixed
directly to the viewport at the top-left. It has a 48x48 hit target and a
z-index above both the backdrop and drawer so title/auth/header elements
cannot cover it.

At <= 480px competing header UI is further reduced.
