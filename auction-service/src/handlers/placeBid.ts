import { Handler } from "aws-lambda"
import { DynamoDB } from "@aws-sdk/client-dynamodb"

import middleware from "../lib/commonMiddleware"
import createError from "http-errors"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { getAuctionById } from "../lib/getAuctionById"
import placeBidSchema from "../lib/schemas/placeBidSchema"
import validator from "@middy/validator"
import { transpileSchema } from "@middy/validator/transpile"

const dynamodb = DynamoDBDocument.from(new DynamoDB())

const placeBid: Handler = async (event, context) => {
  let updatedAuction;

  const { id: auctionId } = event.pathParameters as { id: string };
  const { amount } = event.body as { amount: string };
  const { email } = event.requestContext.authorizer.lambda; // contains the "email" of the authenticated user
  const auction = await getAuctionById(auctionId);
  // Validation checks
  if (!auction) {
    throw new createError.NotFound(`Auction not found`)
  }
  if (auction.status == 'CLOSED') {
    throw new createError.Forbidden(`You cannot bid on closed auctions`)
  }
  if (email === auction.sellerEmail) {
    throw new createError.Forbidden("You can not bid on your auction")
  }
  if (+amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid amount must be greater than ${auction.highestBid.amount}`)
  }

  try {
    const result = await dynamodb.update({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id: auctionId },
      UpdateExpression: "set highestBid.amount = :amount",
      ExpressionAttributeValues: {
        ":amount": amount
      },
      ReturnValues: "ALL_NEW"
    })
    updatedAuction = result.Attributes
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const handler = middleware(placeBid)
  .use(
    validator({
      eventSchema: transpileSchema(placeBidSchema)
    })
  )