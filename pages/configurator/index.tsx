import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

const RoomConfigurator = dynamic(() => import('../../libs/components/configurator/RoomConfigurator'), { ssr: false });

const ConfiguratorPage: NextPage = () => {
  return (
    <div className="configurator-page">
      <RoomConfigurator modelUrl="/models/room.glb" />
    </div>
  );
};

export default ConfiguratorPage;


