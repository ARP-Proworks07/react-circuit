import React from 'react';
import { BaseComponent, BaseComponentProps } from './BaseComponent';

export const ACSource: React.FC<Omit<BaseComponentProps, 'children'>> = (props) => {
  return (
    <BaseComponent {...props}>
      <circle cx="0" cy="0" r="20" fill="none" stroke="black" strokeWidth="2" />
      <path
        d="M-10,0 Q-5,-10 0,0 T10,0"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />
      <text
        x="0"
        y="35"
        textAnchor="middle"
        fill="black"
        fontSize="12"
      >
        {props.value || '120V'}
      </text>
      <circle cx="-20" cy="0" r="3" className="terminal" />
      <circle cx="20" cy="0" r="3" className="terminal" />
    </BaseComponent>
  );
};