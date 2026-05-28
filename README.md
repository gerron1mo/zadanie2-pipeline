# Zadanie 2 – GitHub Actions

**Status:** Pipeline działa poprawnie

## Opis rozwiązania

Pipeline zbudował multi-arch obraz (`linux/amd64` + `linux/arm64`) aplikacji z Zadania 1 i wypchnął go do **GitHub Container Registry (GHCR)**.

### Użyte technologie:
- GitHub Actions
- Docker Buildx
- Trivy (skaner podatności CVE)
- Cache na Docker Hub

### Tagowanie obrazów:
- `ghcr.io/gerron1mo/weather-app:latest`
- `ghcr.io/gerron1mo/weather-app:{commit-sha}`

Cache przechowywany jest w repozytorium na Docker Hub: `gerron1mo/weather-app-cache`

### Uzasadnienie wyboru
Tag latest pozwala szybko pobrać najnowszą wersję aplikacji.
Tag z numerem commita (SHA) daje pewność, z której wersji kodu pochodzi obraz - ułatwia to debugowanie i cofanie zmian.
Cache w trybie max na Docker Hub przyspiesza budowanie obrazu, ponieważ Docker nie musi za każdym razem od nowa pobierać i budować warstw.
Zródło: https://docs.docker.com/build/ci/github-actions/
---

## Jak uruchomić pipeline?
- Push na gałąź `main`
