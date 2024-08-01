import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument, UpdateCommandInput } from "@aws-sdk/lib-dynamodb"
import { Auction } from "../types";

const dynamodb = DynamoDBDocument.from(new DynamoDB())

export async function closeAuction(auction: Auction) {
  const params: UpdateCommandInput = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    }
  };

  const result = await dynamodb.update(params);
  return result;
}