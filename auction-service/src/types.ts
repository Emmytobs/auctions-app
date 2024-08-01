type ISODateString = string
const statuses = ["OPEN", "CLOSED"] as const

export type Auction = {
  id: string,
  title: string,
  status: typeof statuses[number],
  createdAt: ISODateString
  endingAt: ISODateString
  highestBid: {
    amount: number
  }
  sellerEmail: string
}