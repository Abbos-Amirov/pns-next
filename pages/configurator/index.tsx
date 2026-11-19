import type { NextPage } from 'next';
import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Top from '../../libs/components/Top';
import WindowPricingShowcase from '../../libs/components/configurator/window-pricing/WindowPricingShowcase';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';

const ConfiguratorPage: NextPage = () => {
  const device = useDeviceDetect();
  return (
    <div id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
      <div id="top">
        <Top />
      </div>
      <div className="configurator-page window-pricing-page">
        <WindowPricingShowcase />
      </div>
    </div>
  );
};

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'kr', ['common', 'configurator'])),
  },
});

export default ConfiguratorPage;


