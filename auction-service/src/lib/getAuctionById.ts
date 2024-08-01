import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { Auction } from "../types";

const dynamodb = DynamoDBDocument.from(new DynamoDB())

export async function getAuctionById(auctionId: string): Promise<Auction | null> {
  const auction = await dynamodb.get({
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auctionId }
  })
  return auction.Item as Auction;
}