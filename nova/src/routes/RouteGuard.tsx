import { memo } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useTemporaryToken, useUserInfo } from '@store/user';

function RealLogin(props: RouteProps) {
  const { children, ...resets } = props;
  const { isTemporary } = useUserInfo().data;

  return (
    <Route
      {...resets}
      render={(childrenProps) => {
        if (isTemporary) {
          return <Redirect to="/account/login" push={false} />;
        } else {
          return typeof children === 'function' ? children(childrenProps) : children;
        }
      }}
    />
  );
}

function TemporaryLogin(props: RouteProps) {
  const { children, ...resets } = props;
  const token = useSelector((state) => state.user.token);

  return (
    <Route
      {...resets}
      render={(childrenProps) => {
        if (!token) {
          return <AutoTemporaryLogin />;
        } else {
          return typeof children === 'function' ? children(childrenProps) : children;
        }
      }}
    />
  );
}

export default {
  RealLogin: memo(RealLogin),
  TemporaryLogin: memo(TemporaryLogin),
};

function AutoTemporaryLogin() {
  useTemporaryToken();
  return null;
}
