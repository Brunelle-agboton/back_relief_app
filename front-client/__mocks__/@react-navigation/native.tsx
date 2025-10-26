import React from 'react';

export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
});

export const useRoute = () => ({
  params: {},
});