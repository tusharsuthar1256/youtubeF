import { useSelector } from 'react-redux';

export const useAuth = () => {
    const status = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);
    
    return { status, userData };
};
