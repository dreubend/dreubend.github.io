# Trendward customer-safe data contract

The public web application must consume only a deliberately serialized customer-safe payload.

Allowed high-level fields in v1:
- schemaVersion
- generatedAt
- marketStatus
- markets
- kpis
- candidates
- watchlist
- signals
- catalysts

Do NOT expose:
- .env values or API credentials
- IBKR account identifiers or connection information
- paper-trading orders, fills, positions, P&L, or execution state
- private database paths or raw SQLite files
- server logs
- model files
- raw private feature vectors
- internal prompts
- private scanner JSON blobs
- unrestricted filesystem paths
- secrets/tokens
- internal security/identity-cache details

Tier enforcement:
The static preview may hide fields in JavaScript for design testing, but production
authorization MUST enforce subscription entitlements on the server/API before data
is returned. Client-side hiding is not a security boundary.
