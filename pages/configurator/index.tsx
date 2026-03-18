import type { NextPage } from 'next';
import React from 'react';
import WindowPricingShowcase from '../../libs/components/configurator/window-pricing/WindowPricingShowcase';

const ConfiguratorPage: NextPage = () => {
  return (
    <div className="configurator-page window-pricing-page">
      <WindowPricingShowcase />
    </div>
  );
};

export default ConfiguratorPage;


