import { GoogleLogin } from "@react-oauth/google";
import PropTypes from "prop-types";
function Login({ onSuccess, onFailure }) {
  return (
    <div className="flex justify-center items-center h-screen">
      <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
    </div>
  );
}

Login.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default Login;
