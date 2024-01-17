import * as React from 'react';
import { TitleOutlined } from '@mui/icons-material';

import { getCommonBlockCss, getStyleCss } from '../../block/Block';
import useHeadingStore from 'Src/core/setting-panel/store/heading';
import { isHTMLElement } from 'Src/core/utils';

const { useState, useRef, useEffect } = React;
interface HeadingComponentProps extends React.HTMLAttributes<HTMLOrSVGElement> {
  level?: number;
}

const HeadingComponent: React.FC<HeadingComponentProps> = ({ level: number = 2, ...restProps }) => {
  return React.createElement(
    `h${number}`,
    {
      ...restProps,
      style: restProps.style,
      suppressContentEditableWarning: true,
    },
    restProps.children,
  );
};
interface HeadingProps {
  blockdata: any;
}
// const Heading = ({ align, level }: { align: string; level: number }) => {
const Heading = (props: HeadingProps) => {
  // TODO: chore blockdata
  const { blockdata } = props;
  console.log('wong', blockdata);
  // const [styleIdentifier, setStyleIdentifier] = useState(style);
  const { id, level, value } = blockdata.props;
  const defaultValue: any = useRef(value);

  // const changeText = (e?: any) => {
  //   const texts = e.target.innerText;
  //   setText(texts);
  // };

  const common = {
    style: {
      textAlign: blockdata.props.align,
    },
    // ref: (input: any) => input && input.focus(),
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      if (isHTMLElement(e?.target)) {
        // headingStateChange('value', e.target.innerText);
        // emitter.emit('change', e.target.innerText);
      }
    },
    ...(id ? { id: id } : {}),
    // contentEditable: props.active,
  };

  return (
    <div className={getCommonBlockCss('heading', '')}>
      <HeadingComponent level={level} id={id} {...common}>
        {defaultValue.current}
      </HeadingComponent>
    </div>
  );
};

export const toolHeading: ToolDefinition = {
  type: 'heading',
  isComposited: false,
  name: 'Heading',
  menu: { category: 'basic', icon: <TitleOutlined /> },
  initData: () => {
    return {
      type: 'heading',
      data: '',
      settings: { style: { width: 'auto' }, level: 2 },
    };
  },
  render: Heading,
};

Heading.displayName = 'heading';

export default Heading;