# Trendward v12
Fixes refresh/deep-link routing. The previous script called an undefined
`applyFixedTierPage()` before the router initialized, so refreshes on URLs like
`#scanner` showed Overview. v12 removes that call and makes the hash authoritative.
