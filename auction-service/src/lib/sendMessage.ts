import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"

const sqs = new SQSClient();

interface MessageBody {
  recipientEmail: string;
  body: string;
  subject: string;
}

/**
 * 
 * Utility function to produce message records in SQS queue
 * 
 * @param messageBody - body of the message
 */
const sendMessage = async (messageBody: MessageBody) => {
  const sendMessageCommand = new SendMessageCommand({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    DelaySeconds: 10,
    // MessageAttributes: {
    //   Title: {
    //     DataType: "String",
    //     StringValue: "The Whistler",
    //   },
    //   Author: {
    //     DataType: "String",
    //     StringValue: "John Grisham",
    //   },
    //   WeeksOn: {
    //     DataType: "Number",
    //     StringValue: "6",
    //   },
    // },
    MessageBody: JSON.stringify(messageBody),
  });
  await sqs.send(sendMessageCommand)
}

export {
  sendMessage
}