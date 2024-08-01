import { Handler } from "aws-lambda"
import { DynamoDB, PutItemInput } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { v4 as uuid } from "uuid"

import createError from "http-errors"
import middleware from "../lib/commonMiddleware"
import createAuctionSchema from "../lib/schemas/createAuctionSchema"
import { Auction } from "../types"
import validator from "@middy/validator"
import { transpileSchema } from "@middy/validator/transpile"

/*
  DynamoDBDocument returns a dynamodb client that handles marshalling and unmarshalling automatically.
  Read more about this here: 
  * https://www.npmjs.com/package/@aws-sdk/lib-dynamodb
  * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-util-dynamodb/

*/
const dynamodb = DynamoDBDocument.from(new DynamoDB())

const createAuction: Handler = async (event, context) => {
  const { title } = event.body  // request payload
  const { email } = event.requestContext.authorizer.lambda;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction: Auction  = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0
    },
    sellerEmail: email
  }
  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction
    })
    return {
      statusCode: 201,
      body: JSON.stringify(auction),
    };
  } catch (error) {
    console.error("Error with dynamodb", error);
    throw new createError.InternalServerError(error);
  }
};

export const handler = middleware(createAuction)
  .use(
    validator({
      eventSchema: transpileSchema(createAuctionSchema)
    })
  )