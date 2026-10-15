# Data and Contracts

Review the provided files for functional data-flow and API-contract issues.

Pay extra attention to:
- API contract — does the function/endpoint deliver what its name and signature promise to callers, do changes break existing consumers
- Data flow — does data arrive in the shape the code expects at each step, are transformations applied in the right order
- Boundary validation — is data crossing API or external-service boundaries validated to the shape and constraints downstream code relies on
- Backwards compatibility — does this change break existing behavior for callers, stored data, or running instances during deployment
