import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AccountType, changeAccountType } from '@store/wallet';
import useNavigate from '@hooks/useNavigate';
import { SvgIcon } from '@components';

const CloseButton: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    dispatch(changeAccountType(AccountType.DEMO));
    navigate('/trade-center', {
      replace: true,
    });
  }, [dispatch, navigate]);

  return (
    <button
      onClick={handleClose}
      className="fixed top-4 right-4 s768:top-6 s768:right-6 hover:opacity-75 transition-opacity z-50"
      aria-label="Close guide"
    >
      <SvgIcon name="close" className="size-5 s768:size-6" />
    </button>
  );
};

export default React.memo(CloseButton);
