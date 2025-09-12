import { createElement, ReactElement, ReactNode } from 'react';
import { type RouteProps } from 'react-router-dom';
import { type ModalProps } from '@components';

export interface ModalRouteProps extends Omit<ModalProps, 'onClose' | 'children' | 'unstyled'> {
  path: string | string[];
  component?: Parameters<typeof createElement>[0];
  children?: ReactElement;
}

export interface MobileSecondaryRouteProps extends RouteProps {
  title?: ReactNode;
}
