// import jwt from 'jsonwebtoken';
import { APIGatewayIAMAuthorizerResult, APIGatewayRequestIAMAuthorizerHandlerV2 } from "aws-lambda"

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, routeArn): APIGatewayIAMAuthorizerResult => {
  const apiGatewayWildcard = routeArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        },
      ],
    },
  };
};

const authFunc: APIGatewayRequestIAMAuthorizerHandlerV2 = async (event, context, callback) => {
  console.log({ event, context, callback })
  const token = event.headers?.authorization?.replace("Bearer ", "")
  if (!token) {
    // There might be a better way to handle this exception
    throw 'Unauthorized';
  }

  try {
    // TODO: This is a mock value. Get the actual JWT claims object.
    // const claims = jwt.verify(token, process.env.AUTH0_PUBLIC_KEY);
    const claims = {
      email: "real4emmydee@gmail.com"
    }
    const policy = generatePolicy("user", event.routeArn);

    return {
      ...policy,
      context: claims
    };
  } catch (error) {
    console.log(error);
    throw 'Unauthorized';
  }
};

export const handler = authFunc;