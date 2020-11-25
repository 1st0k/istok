# @istok/core

istok's core entites, types and helpers to make extensions.

### Sources

Source - repository with resources. Source can get resource by id, set resource with data by id, get filtered list of resources and clear all resources.

Sources Sequence - sequence of sources with primary use case for caches.

- Get resource from the first source where it is available.
- Set resource to all sources in the sequence.

Cachable Source - Sources Sequence with invalidation rules.