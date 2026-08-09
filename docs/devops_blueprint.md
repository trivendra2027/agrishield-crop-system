# CI/CD & DevOps Blueprint
- **Branch Strategy**: `main` (Production), `develop` (Staging), `feature/*`.
- **GitHub Actions**: On pull request -> Run Python PyTest, Node ESLint, and output Coverage.
- **Releases**: Semantic versioning (v1.0.0).
