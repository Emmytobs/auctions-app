import { SQSHandler } from "aws-lambda"
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: process.env.REGION })

interface EmailPayload {
  recipientEmail: string;
  body: string;
  subject: string;
}
const sendMail: SQSHandler = async (event) => {
  const records = event.Records;
  const fromAddress = "real4emmydee@gmail.com"
  try {
    const results = await Promise.all(
      records.map(record => {
        const { recipientEmail, body, subject } = JSON.parse(record.body) as EmailPayload;
        const sendEmailCommand = new SendEmailCommand({
          Destination: {
            ToAddresses: [
              recipientEmail
            ],
          },
          Message: {
            Body: {
              Text: {
                Charset: "UTF-8",
                Data: body,
              },
            },
            Subject: {
              Charset: "UTF-8",
              Data: subject,
            },
          },
          Source: fromAddress,
        });
        return sesClient.send(sendEmailCommand)
      })
    )
    console.log(results)
  } catch (error) {
    console.log(error)
  }
}

export const handler = sendMail