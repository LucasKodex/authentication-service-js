## Roadmap

Feature | Status
:-----: | :----:
Sign Up | Development Done (still needs automated tests)
Log In  | Not Started
Revoke Refresh Token / Revoke Session | Not Started
Get an Access Token using Refresh Token | Not Started
Assymetric JWT Signing | Not Started

## 1. Setup and Running

### 1.1 Start your PostgreSQL database

```sh
docker container run --name pgsql_db --network pgsql_net -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=p445w0rd -e POSTGRES_DB=auth --rm -d postgres
```

and fill the `DATABASE_CONNECTION_URL` in `.env` file such as

```toml
DATABASE_CONNECTION_URL="postgresql://user:p445w0rd@localhost:5432/auth"
```

### 1.2 Start your Redis database

```sh
docker container run --name redis_db --network redis_net -p 6379:6379 --rm -d redis
```

and fill the `REDIS_CONNECTION_URL` in `.env` file such as

```toml
REDIS_CONNECTION_URL="redis://localhost:6379"
```

### 1.3 Build the application

Install the project dependencies

```sh
yarn install
```

Build the application

```sh
yarn build
```

It will generate the build files under the `dist` folder.

### 1.4 Configuration and .env

You should finish filling the `.env` file like the following example or setting those variables in your environment. (note: the project is using `dotenv-safe` so you must set those variables)

```toml
SERVER_PORT="80"
SERVER_HOSTNAME="localhost"
OPENAPI_SPECIFICATION_FILE_PATH="./openapi.yml"
DATABASE_CONNECTION_URL="postgresql://user:p445w0rd@localhost:5432/auth"
REDIS_CONNECTION_URL="redis://localhost:6379"
DEFAULT_USER_ROLE="USER"
JWT_SECRET_KEY="G!$x8k4EvuX9w5fM6i6gwqX@qC2C%9pkn6Q4akRX#J4oDu&X%4APUN*a@!5BGx6YzE5G^8k2@3%K7fxQw8^TasK@2R8Mg7&Kna&ikWinkCkBJWnboq24uHCyirKTu$gx"
```

Environment Variable | Description
:------------------: | :----------
SERVER_PORT | Express port to be binded to
SERVER_HOSTNAME | Express hostname to be binded to
OPENAPI_SPECIFICATION_FILE_PATH | OpenAPI/Swagger specification path (json or yaml)
DATABASE_CONNECTION_URL | PostgreSQL database URL for connection
REDIS_CONNECTION_URL | Redis database URL for connection
DEFAULT_USER_ROLE | Default role to new users (auto created if don't exists)
JWT_SECRET_KEY | Secret key for signing JSON Web Tokens

### 1.5 Running the application

And finally if everything did well you can run the application

```sh
yarn start
```
