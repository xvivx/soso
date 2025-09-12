import { Fragment, lazy, memo } from 'react';
import { Route, Switch } from 'react-router-dom';
import { PartnerHome } from '@pages/Partner';
import Footer from './Footer';
import PartnerHead from './PartnerHead';

const ContactUs = lazy(() => import('@pages/Landing/ContactUs'));
export default memo(function PartnerLayout() {
  return (
    <Fragment>
      <PartnerHead />
      <main className="pt-18">
        <Switch>
          <Route path="/partner/contact/us" component={ContactUs} />
          <Route component={PartnerHome} />
        </Switch>
      </main>
      <Footer />
    </Fragment>
  );
});
