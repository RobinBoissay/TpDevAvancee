# Realtime Elo Ranker

## Lancer l'application cliente

*Prérequis :*

Le client repose sur une source CSS exposée par la librairie `libs/ui` (@realtime-elo-ranker/libs/ui). Il est nécessaire de construire la lib pour rendre la source accessible.

Pour ce faire :

```bash
nvm install 22
nvm use 22
corepack enable pnpm
pnpm install

pnpm run libs:ui:build
```

**Puis**

Lancer l'application :

```bash
pnpm run apps:client:dev
```
