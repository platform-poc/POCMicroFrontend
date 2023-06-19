import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import {
  MsalProvider,
  useMsal,
  useIsAuthenticated,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";

import { callMsGraph } from "./service/graph";

import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  InteractionStatus,
  BrowserAuthError,
} from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";

import AppContainer from "./components/AppContainer";

import axios from "axios";

console.log("init msal");
const msalInstance = new PublicClientApplication(msalConfig);
msalInstance
  .handleRedirectPromise()
  .then((tokenResponse) => {
    // Handle redirect promise
  })
  .catch((error) => {
    // Handle redirect error
  });

const AfterAuth = () => {
  const [accessToken, setAccessToken] = useState("");
  const [graphData, setGraphData] = useState(null);

  const { instance, accounts, inProgress } = useMsal();

  const isAuthenticated = useIsAuthenticated();

  const getAccessTokenPopup = (tokenRequest) => {
    const accessTokenRequest = { ...tokenRequest };
    if (accounts.length > 0) accessTokenRequest.account = accounts[0];
    instance
      .acquireTokenPopup(accessTokenRequest)
      .then(function (accessTokenResponse) {
        // Acquire token interactive success
        const accessToken = accessTokenResponse.accessToken;
        // Call your API with token
        setAccessToken(accessToken);
      })
      .catch(function (error) {
        // Acquire token interactive failure
        console.log(error);
      });
  };

  const getAccessTokenRedirect = (tokenRequest) => {
    const accessTokenRequest = { ...tokenRequest };
    if (accounts.length > 0) accessTokenRequest.account = accounts[0];
    instance
      .acquireTokenRedirect(accessTokenRequest)
      .then(function (accessTokenResponse) {
        // Acquire token interactive success
        const accessToken = accessTokenResponse.accessToken;
        // Call your API with token
        setAccessToken(accessToken);
      })
      .catch(function (error) {
        // Acquire token interactive failure
        console.log(error);
      });
  };

  const RequestProfileData = () => {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    console.log("Getting host graph token silently");
    const tokenRequest = {
      scopes: ["User.Read"],
    };
    const accessTokenRequest = {
      ...tokenRequest,
      account: accounts[0],
    };
    instance
      .acquireTokenSilent(accessTokenRequest)
      .then((response) => {
        setAccessToken(response.accessToken);
        // getAuth0Token(response.accessToken);
        const azureTokenEvt = new CustomEvent("AzureAccessTokenEvt", {
          detail: { access_token: response.accessToken },
        });
        console.log("emmitting azure access token");
        document.dispatchEvent(azureTokenEvt);
        callMsGraph(response.accessToken).then((response) =>
          setGraphData(response)
        );
      })
      .catch((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          getAccessTokenPopup(tokenRequest);
        }
        if (error instanceof BrowserAuthError) {
          getAccessTokenRedirect(tokenRequest);
        }
        console.warn(error);
      });
  };

  const accessTokenRequestEventHandler = (evt) => {
    const azureTokenEvt = new CustomEvent("AzureAccessTokenEvt", {
      detail: { access_token: accessToken },
    });
    console.log("emmitting azure access token");
    document.dispatchEvent(azureTokenEvt);
  };

  const listenForAccessTokenRequest = () => {
    document.addEventListener(
      "GetAzureAccessTokenEvt",
      accessTokenRequestEventHandler
    );
  };

  useEffect(() => {
    if (graphData) return;
    if (inProgress !== InteractionStatus.None) return;
    if (!isAuthenticated) {
      getAccessTokenRedirect({scopes: ['User.Read']});
    }
    if (accounts.length < 1) return;

    RequestProfileData();
  }, [instance, accounts, inProgress, graphData]);

  useEffect(() => {
    document.removeEventListener(
      "GetAzureAccessTokenEvt",
      accessTokenRequestEventHandler
    );
    if (accessToken) {
      listenForAccessTokenRequest();
    }
  }, [accessToken]);

  return <></>;
};

 const BeforeAuth = () => {

  const { instance, accounts } = useMsal();

  useEffect(()=>{
    // redirect to login
    instance.loginRedirect().catch(e => {
      console.log(e);
    });
  },[]);
  return <></>
}

export default function App() {
  const { instance, accounts } = useMsal();

  return (
    <div className="mx-auto max-w-6xl">
      <AuthenticatedTemplate>
      <AfterAuth />
      <AppContainer />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <BeforeAuth />
      </UnauthenticatedTemplate>
    </div>
  );
}

createRoot(document.getElementById("host-app")).render(
  // <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  // </React.StrictMode>
);
