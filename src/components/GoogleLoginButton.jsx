import { GoogleLogin } from "react-google-login";
import PropTypes from "prop-types";

function GoogleLoginButton({ onSuccess, onFailure }) {
  return (
    <GoogleLogin
      clientId={import.meta.env.VITE_YOUTUBE_CLIENT_ID}
      buttonText="Login with Google"
      onSuccess={onSuccess}
      onFailure={onFailure}
      cookiePolicy={"single_host_origin"}
      scope="https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl"
    />
  );
}

GoogleLoginButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default GoogleLoginButton;
