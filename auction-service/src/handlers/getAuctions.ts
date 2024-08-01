import { Handler, APIGatewayRequestAuthorizerEvent } from "aws-lambda"
import { DynamoDB } from "@aws-sdk/client-dynamodb"

import middleware from "../lib/commonMiddleware"
import auctionsSchema from "../lib/schemas/getAuctionsSchema"
import createError from "http-errors"
import validator from "@middy/validator"
import { transpileSchema } from "@middy/validator/transpile"
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb"

const dynamodb = DynamoDBDocument.from(new DynamoDB())

const getAuctions: Handler = async (event: APIGatewayRequestAuthorizerEvent, context) => {
  const { status } = event.queryStringParameters as { status: string }; // @middy/validator auto-passes the qsParam with a default value of "OPEN" if it's not passed in
  const params: QueryCommandInput = { 
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":status": status
    }
  }
  let auctions;
  
  try {
    const result = await dynamodb.query(params)
    auctions = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
};

export const handler = middleware(getAuctions)
  .use(
    validator({ 
      eventSchema: transpileSchema(auctionsSchema)
    })
  )