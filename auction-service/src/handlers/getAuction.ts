import { Handler, APIGatewayEvent } from "aws-lambda"
import middleware from "../lib/commonMiddleware"
import createError from "http-errors"
import { getAuctionById } from "../lib/getAuctionById"

const getAuction: Handler = async (event: APIGatewayEvent, context) => {
  let auction;

  const { id: auctionId } = event.pathParameters as { id: string };
  try {
    auction = await getAuctionById(auctionId)
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Auction with id ${auctionId} not found`)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
};

export const handler = middleware(getAuction);