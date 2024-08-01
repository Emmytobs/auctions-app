import middy from "@middy/core"
import httpEventNormalizer from "@middy/http-event-normalizer"
import httpErrorHandler from "@middy/http-error-handler"
import httpJsonBodyParser from "@middy/http-json-body-parser"
import { Handler } from "aws-lambda"

export default (handler: Handler) => middy(handler)
  .use([
    httpEventNormalizer(),
    httpErrorHandler(),
    httpJsonBodyParser({
      disableContentTypeError: true
    })
  ])