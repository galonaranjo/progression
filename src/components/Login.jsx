import PropTypes from "prop-types";

function Login({ onSuccess }) {
  return (
    <div className="flex justify-center items-center h-screen">
      <button onClick={onSuccess} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Sign in with Google
      </button>
    </div>
  );
}

Login.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default Login;
