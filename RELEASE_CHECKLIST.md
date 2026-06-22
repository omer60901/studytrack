Release checklist

- [ ] Update version in `package.json` (root, client, server)
- [ ] Ensure `MONGO_URI` is set for production
- [ ] Build client and server: `npm run build --prefix client` and `npm run build --prefix server`
- [ ] Run smoke tests: `npm --prefix server run smoke`
- [ ] Push Docker images or create CI pipeline to build/publish
- [ ] Update environment variables in deployment (JWT_SECRET, MONGO_URI, NODE_ENV=production)
- [ ] Run Lighthouse audit and review results
- [ ] Tag release and create GitHub Release notes
- [ ] Monitor logs after deploy
