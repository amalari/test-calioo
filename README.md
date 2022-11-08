# Test Calioo
## API
| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | /inventory | Stores inventory items in the database |
| GET | /inventory/{id} | display the inventory you just created using |
| GET | /inventory | display the first 10 inventory items in database, allow pagination to show further items |
| PUT | /inventory-discount | Applies a discount to all the inventory items of a specific category. If no category is provided, apply it to all items. |
| GET | /swagger | See documentation detail and playground to check available API |

## Installation
Install the serverless CLI via NPM:
```sh
npm i -g serverless
```
Install package that used in this app:
```sh
npm i
```
Install package that used in this app:
```sh
npm i
```

## How to test
```sh
npm run test
```

## How to run in local
Install serverless dynamodb local
```sh
sls dynamodb
```
run the app locally using this command
```sh
sls offline start
```

## How to deploy
Make sure your computer have been connected with your aws account
```sh
aws configure
```
deploy your app
```sh
sls deploy
```
