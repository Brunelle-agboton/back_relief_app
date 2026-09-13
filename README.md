# back_relief_app

## Front-client
```
    npx expo start --tunnel
```

## Backend en local (docker compose)

```bash
cp backend/.env.example backend/.env
# puis, dans backend/.env :
#   POSTGRES_HOST=db      <- nom du service compose, pas localhost
#   POSTGRES_PORT=5432    <- port interne du conteneur, pas le 5433 publié
docker compose up --build
```

### POSTGRES_DB et POSTGRES_DATABASE

Les deux variables doivent exister dans `backend/.env` **et porter la même
valeur** :

| Variable | Lue par | Rôle |
|---|---|---|
| `POSTGRES_DATABASE` | le backend (`ConfigService`) | base à laquelle se connecter |
| `POSTGRES_DB` | l'image Docker `postgres` | base à créer au premier démarrage |

L'image postgres ignore `POSTGRES_DATABASE`. Si `POSTGRES_DB` est absente, elle
crée une base nommée d'après `POSTGRES_USER` et le backend boucle sur :

```
db-1 | FATAL:  database "healthtracker" does not exist
```

Hors docker compose (Render, base gérée), seul `POSTGRES_DATABASE` est utile.

### Réinitialiser la base

La base n'est créée qu'au **tout premier** démarrage, quand le répertoire de
données est vide. Après toute correction des variables `POSTGRES_*`, il faut
donc repartir de zéro — sinon l'entrypoint saute l'initialisation et rien ne
change :

```bash
docker compose down -v
rm -rf dbData
docker compose up --build
```

C'est aussi la procédure pour réinjecter le praticien de démonstration.

### Migrations

En développement, `DB_SYNCHRONIZE=true` laisse TypeORM créer le schéma. Pour
travailler comme en production (migrations, `synchronize` désactivé) :

```bash
# dans backend/.env : DB_SYNCHRONIZE=false
docker compose exec backend npm run migration:run
docker compose exec backend npm run migration:show
```
