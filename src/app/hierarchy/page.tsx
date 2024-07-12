'use client';

import React, { useEffect } from 'react';
import Hierarchy from '@/app/hierarchy/Hierarchy';
import store from '@/app/store';
import { Provider } from 'react-redux';
import Modal from 'react-modal';

const Page: React.FC = () => {
  useEffect(() => {
    Modal.setAppElement('#__next');
  }, []);
  return (
    <Provider store={store}>
      <Hierarchy></Hierarchy>
    </Provider>
  );
};

export default Page;
