# back_relief_app

## Front-client
```
    npx expo start --tunnel
```

## DB
To add a practicien interviewer, assure to recreate the db container if is already exist
```
    docker compose down
    rm -rf dbData
    docker compose up --build ...
```
