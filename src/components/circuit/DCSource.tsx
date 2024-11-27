import React from 'react';
import { BaseComponent, BaseComponentProps } from './BaseComponent';

export const DCSource: React.FC<Omit<BaseComponentProps, 'children'>> = (props) => {
  return (
    <BaseComponent {...props}>
      <circle cx="0" cy="0" r="20" fill="none" stroke="black" strokeWidth="2" />
      <line x1="-8" y1="-12" x2="-8" y2="12" stroke="black" strokeWidth="2" />
      <line x1="8" y1="-8" x2="8" y2="8" stroke="black" strokeWidth="2" />
      <text
        x="0"
        y="25"
        textAnchor="middle"
        fill="black"
        fontSize="12"
      >
        {props.value || '5V'}
      </text>
      <circle cx="-20" cy="0" r="3" className="terminal" />
      <circle cx="20" cy="0" r="3" className="terminal" />
    </BaseComponent>
  );
}; 