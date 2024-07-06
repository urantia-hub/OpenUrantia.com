import AWS from "aws-sdk";

const configureAWS = () => {
  if (!AWS.config.region) {
    AWS.config.update({
      region: process.env.AWS_REGION || "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
};

let dynamoDB: AWS.DynamoDB.DocumentClient;

const getDynamoDBClient = () => {
  if (!dynamoDB) {
    configureAWS();
    dynamoDB = new AWS.DynamoDB.DocumentClient();
  }
  return dynamoDB;
};

export default getDynamoDBClient;
