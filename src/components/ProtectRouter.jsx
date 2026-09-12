import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const ProtectRouter = ({ children }) => {
    const { token, user, loading } = useContext(AuthContext);

    if (loading) {return null}

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectRouter;
