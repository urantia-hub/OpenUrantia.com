import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

const CustomErrorComponent = (props) => {
  if (props.error) {
    Sentry.captureException(props.error);
  }
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  await Sentry.withScope(async (scope) => {
    scope.setTag("page", contextData?.asPath);
    scope.setExtra("url", contextData?.req?.url);
    scope.setExtra("method", contextData?.req?.method);

    await Sentry.captureUnderscoreErrorException(contextData);
  });

  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
