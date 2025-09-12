import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function TwitterCallback() {
  const { search } = useLocation();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(search);
      const oauthToken = params.get('oauth_token') || '';
      const oauthVerifier = params.get('oauth_verifier') || '';

      if (oauthToken && oauthVerifier) {
        window.opener.postMessage(JSON.stringify({ oauthToken, oauthVerifier }), '*');
        window.close();
      }
    })();
  }, [search]);

  return <></>;
}

export default TwitterCallback;
