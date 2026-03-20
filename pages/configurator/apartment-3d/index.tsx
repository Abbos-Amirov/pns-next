import type { NextPage } from 'next';
import React from 'react';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Top from '../../../libs/components/Top';

const ApartmentConfiguratorDynamic = dynamic(
  () => import('../../../libs/components/configurator/apartment/ApartmentConfigurator'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        flex: 1,
        minHeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e8e6e2',
        color: '#666',
        fontSize: 14,
      }}>
        Loading...
      </div>
    ),
  }
);

const Apartment3DPage: NextPage = () => {
  return (
    <div id="pc-wrap" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div id="top" style={{ flexShrink: 0 }}>
        <Top />
      </div>
      <div className="configurator-page apartment-3d-page" style={{ flex: 1, display: 'flex' }}>
        <ApartmentConfiguratorDynamic showSidePanel />
      </div>
    </div>
  );
};

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'kr', ['common', 'configurator'])),
  },
});

export default Apartment3DPage;
