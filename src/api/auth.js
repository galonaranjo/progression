import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(import.meta.env.VITE_YOUTUBE_CLIENT_ID);

export const initializeGoogleAuth = () => {
  return new Promise((resolve) => {
    window.gapi.load("auth2", () => {
      window.gapi.auth2
        .init({
          client_id: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
        })
        .then(resolve);
    });
  });
};

export const signIn = async () => {
  const auth2 = window.gapi.auth2.getAuthInstance();
  const googleUser = await auth2.signIn();
  const authResponse = googleUser.getAuthResponse(true);
  localStorage.setItem("accessToken", authResponse.access_token);
  localStorage.setItem("refreshToken", authResponse.refresh_token);
  return authResponse.access_token;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await client.refreshAccessToken(refreshToken);
  const tokens = response.credentials;
  localStorage.setItem("accessToken", tokens.access_token);
  return tokens.access_token;
};

export const signOut = async () => {
  const auth2 = window.gapi.auth2.getAuthInstance();
  await auth2.signOut();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
