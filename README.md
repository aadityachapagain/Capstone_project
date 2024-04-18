# COMPASS PROJECT

## Project Strcture

### Frontend

inside frotnend directory , you will find react project

### Backend

Inside app directory, you will find fastapi project which contains all the api's to this project

## Deployment

Deployment is done using projen

## How to deploy

- you need to export aws key and secret to deploy this project

```
export AWS_ACCESS_KEY_ID=<aws_key>
export AWS_SECRET_ACCESS_KEY=<aws_secret>
export AWS_REGION="ap-southeast-2"

# finally run projen deploy
npx projen deploy
```

- all the deployment code can be seen inside src directory
