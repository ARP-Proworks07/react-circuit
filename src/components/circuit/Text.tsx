import React from 'react';
import { BaseComponent, BaseComponentProps } from './BaseComponent';

export const Text: React.FC<Omit<BaseComponentProps, 'children'>> = (props) => {
  return (
    <BaseComponent {...props} controlsOffset={30} controlsPosition="bottom">
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="black"
        fontSize="14"
        fontFamily="sans-serif"
        className="select-none"
      >
        {props.value || 'Text'}
      </text>
    </BaseComponent>
  );
}; 