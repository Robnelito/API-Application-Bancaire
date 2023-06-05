# API Gestion Bancaire

Cette API fonctionne avec une base de données **PostgreSql** (version 15)

## Guide d'Installation & de Configuration

1. Cloner le repository

````console
git clone https://github.com/Robnelito/apigb.git
cd API-GB
git checkout develop
````

2. Installer les dépendances

```console
npm install
```

3. Configurer l'envirenement dotenv
   Aprés avoir creer la base de données, créer le fichier ``.env`` à la racine du projet. Puis completer la
   configuration.

```.text
SERVER_PORT=[port pour l'application node]
PG_HOST=[host du server postgres]
PG_DB=[nom de la base de données]
PG_USER_NAME=[nom de l'utilisateur]
PG_USER_PASSWORD=[mot de passe de l'utilisateur]
PG_PORT=[port du serveur postgres] 
```
