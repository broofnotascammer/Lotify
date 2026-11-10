# Lotify 1.0 — Hardware & Software Compatibility

## 1. Hardware Compatibility Baseline (MacBookPro9,1)
- **CPU**: Intel Core i7-3720QM (Ivy Bridge, 4C/8T)
  - Instruction Set: x86-64-v2 (SSE4.2 mandatory, AVX1 supported, AVX2 unsupported, FMA3 unsupported).
  - Target ABI: `x86_64` ELF.
- **GPU**: Intel HD Graphics 4000 (Mesa `crocus` driver)
  - Context: OpenGL ES 3.0.
  - ASTC Support: Absent in silicon. Handled via `CPU_SOFTWARE_DECOMPRESSION` fallback.
  - Secondary GPU: NVIDIA GeForce GT 650M (Kepler, PRIME offload supported).
- **RAM**: 8 GB reference budget.
  - ART Managed Heap Budget: 512 MB max heap, 256 MB growth limit.

## 2. Dynamic Portability & Scaling
Lotify dynamically adapts to host capabilities:
- **RAM < 4 GB**: Budgets 256 MB ART managed heap (low memory profile).
- **RAM 4–8 GB**: Budgets 512 MB ART managed heap (balanced profile).
- **RAM > 8 GB**: Budgets 768 MB ART managed heap (high-performance profile).
- **Modern CPUs**: Enables AVX2 and FMA3 vectorized execution paths dynamically.
- **Modern GPUs**: Uses hardware ASTC texture decoding when available on Intel Gen9+, AMD, or modern NVIDIA.
