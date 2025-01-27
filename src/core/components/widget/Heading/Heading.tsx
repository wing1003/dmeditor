import React, { useEffect, useRef, useState } from 'react';
import {
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
  LoopOutlined,
  TitleOutlined,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField';

import { StyleSettings } from '../../../../styles/StyleSettings';
import { ToolDefinition, ToolRenderProps } from '../../../../ToolDefinition';
import { PropertyButton, PropertyItem, Ranger, Util } from '../../../utils';
import { getCommonBlockCss, getStyleCss } from '../../Block/Block';
import { BlockProperty } from 'Components/BlockProperty';
import { CommonSettings } from 'Core/setting-panel';

const Heading = (props: ToolRenderProps) => {
  const [text, setText] = useState(props.blockdata.data);
  const [level, setLevel] = useState(props.blockdata.settings?.level || 2);
  const [id, setId] = useState(props.blockdata.settings?.id || '');
  const [styleIdentifier, setStyleIdentifier] = useState(props.blockdata.style);
  const [commonSettings, setCommonSettings] = useState(props.blockdata.settings?.style || {});
  const defaultValue: any = useRef(props.blockdata.data);
  const changeText = (e?: any) => {
    const texts = e.target.innerText;
    setText(texts);
  };

  const common = {
    ref: (input: any) => input && input.focus(),
    onKeyUp: changeText,
    ...(id ? { id: id } : {}),
    contentEditable: props.active,
  };

  const render = () => {
    switch (level) {
      case 1:
        return (
          <h1 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h1>
        );
      case 2:
        return (
          <h2 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h2>
        );
      case 3:
        return (
          <h3 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h3>
        );
      case 4:
        return (
          <h4 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h4>
        );
      case 5:
        return (
          <h5 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h5>
        );
      default:
        return (
          <h2 {...common} suppressContentEditableWarning>
            {defaultValue.current}
          </h2>
        );
    }
  };

  const autoCreateId = () => {
    const texts = text;
    let newId = texts
      .trim()
      .replace(/\s/g, '-')
      .replace(/[^\w\-]/g, '')
      .toLowerCase();
    setId(newId);
  };

  useEffect(() => {
    let newData = {
      ...props.blockdata,
      data: text,
      settings: { level: level, style: commonSettings, id: id },
      style: styleIdentifier,
    };
    props.onChange(newData, true);
  }, [text, level, id, commonSettings, styleIdentifier]);

  return (
    <>
      {props.active && (
        <BlockProperty blocktype="heading" inBlock={props.inBlock}>
          <PropertyItem label="Level">
            <Ranger
              defaultValue={level}
              min={1}
              max={5}
              step={1}
              onChange={(v: any) => {
                setLevel(v);
                defaultValue.current = text;
              }}
            />
          </PropertyItem>
          <PropertyItem label="Anchor">
            <TextField
              sx={{ width: 'calc(100% - 37px)' }}
              placeholder="Please enter ID"
              value={id}
              size="small"
              hiddenLabel
              variant="outlined"
              onChange={(e) => {
                setId(e.target.value);
              }}
            />
            <PropertyButton
              title="Auto generate Id"
              onClick={() => {
                autoCreateId();
              }}
            >
              <LoopOutlined />
            </PropertyButton>
          </PropertyItem>
          {Util.renderCustomProperty(props.blockdata)}
          <StyleSettings
            styleIdentifier={props.blockdata.style || ''}
            blocktype="heading"
            onChange={(identifier) => {
              setStyleIdentifier(identifier);
            }}
          />
          <div>
            <CommonSettings
              commonSettings={commonSettings}
              onChange={(settings) => {
                setCommonSettings(settings);
              }}
              onDelete={props.onDelete}
            />
          </div>
        </BlockProperty>
      )}
      <div style={commonSettings} className={getCommonBlockCss('heading', styleIdentifier)}>
        {render()}
      </div>
    </>
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
