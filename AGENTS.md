# Architecture rules
- Keep offline queue replay single-flight and ordered, with bounded network/session waits and a finally-unlocked status; dependent financial mutations must not overtake failures.
- Register optional background sync via getRegistration, never by awaiting serviceWorker.ready; preview and devices without a worker must still complete offline saves.
- Keep controlled edit drawer/dialog roots mounted during close and await destructive mutations before dismissing; focus and scroll locks must unwind even when the selected record disappears.
- Let the global network indicator own sync completion invalidation; read-only network consumers must not repeat refetches.
- POST bodies must carry a client-generated id and Prefer resolution=ignore-duplicates so a replayed request after a lost response never inserts a duplicate financial record.