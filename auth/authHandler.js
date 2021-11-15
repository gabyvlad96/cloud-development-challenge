const API_IDENTIFIER = "5q2f6fyes7";
// const ARN = "242346692193";

exports.handler = async (event) => {
  const token = event.authorizationToken;
  console.log(event);
  let effect = "Deny";
  if (token === "allowTest") {
    effect = "Allow";
  }

  const policy = {
    "principalId": "user",
    "policyDocument": {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Action": "execute-api:Invoke",
          "Effect": effect,
          "Resource": event.methodArn,
        }
      ]
    },
  }

  return policy;
};
