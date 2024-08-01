import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb"

const dynamodb = DynamoDBDocument.from(new DynamoDB())

export async function getEndedAuctions() {
  const now = new Date()

  const params: QueryCommandInput = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    // "#status" is prefixed with "#" because the word "status" is a reserved word: https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-KeyConditionExpression
    KeyConditionExpression: "#status = :status AND endingAt <= :now",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": "OPEN",
      ":now": now.toISOString()
    }
  };

  const result = await dynamodb.query(params);
  return result;
}