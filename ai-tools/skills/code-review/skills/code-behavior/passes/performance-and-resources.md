# Performance and Resources

Review the provided files for performance and resource issues.

Pay extra attention to:
- Performance — unnecessary O(n²) where O(n) is trivial, repeated expensive operations inside loops, large payloads built in memory when streaming is available
- Race conditions — concurrent access to shared state, TOCTOU in async flows, missing locks/transactions where ordering matters
- Side effect leakage — functions that mutate input arguments, shared references modified across async boundaries, event listeners not cleaned up
- Resource ownership — transactions, locks, streams, file handles, and similar acquired resources are released or rolled back on success, error, and cancellation paths
- Resource exhaustion — unbounded array growth, missing pagination on DB queries, no backpressure on streams/queues
