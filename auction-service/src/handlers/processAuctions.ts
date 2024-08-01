import createError from "http-errors";
import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndedAuctions";
import { Auction } from "../types";

async function processAuctions () {
  try {
    const auctionsToClose = await getEndedAuctions()
    if (auctionsToClose.Items && auctionsToClose.Items.length) {
      const closedAuctionsBatch = auctionsToClose.Items.map((auction) => closeAuction(auction as Auction))
      await Promise.all(closedAuctionsBatch);
      return {
        closed: closedAuctionsBatch.length
      }
    }
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error)
  }
}

export const handler = processAuctions;