import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DeleteOutline,
  FormatAlignCenter,
  FormatAlignLeft,
  FormatAlignRight,
} from '@mui/icons-material';
import { MenuItem, Select } from '@mui/material';

import { useEditorStore } from '../main/store';
import Property from './property-setting/property-item';
import { common_properties } from './resigter';
import { properties } from 'Components/widgets';
import { PickColor, PropertyButton, PropertyGroup, PropertyItem, Ranger } from 'Core/utils';

interface CommonSettingsType {
  align: string;
  backgroundColor: string;
  color: string;
  marginTop: number;
  height: number;
  padding: number;
  width: number;

  selectedWidgetIndex: number;
}

export const CommonSettings = (props: {
  commonSettings: any;
  settingList?: Array<string>;
  onDelete?: () => void;
  onChange: (data: any) => void;
  commonChange: (type: keyof CommonSettingsType, data: any) => void;

  selectedWidgetIndex: number;
}) => {
  const { selectedWidgetIndex, onChange = () => {}, commonChange = () => {} } = props;
  const [settings, setSettings] = useState(props.commonSettings ? props.commonSettings : {});
  const [isChange, setIsChange] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const { getSelectedWidget, designer } = useEditorStore();

  const selectedWidget = useMemo(
    () => getSelectedWidget(props.selectedWidgetIndex),
    [props.selectedWidgetIndex],
  );

  const [widthType, setWidthType] = useState(() => {
    if (props.commonSettings) {
      if (props.commonSettings?.width) {
        if (props.commonSettings.width !== '100%' && props.commonSettings.width !== 'auto') {
          return 'custom';
        } else {
          return props.commonSettings.width;
        }
      } else {
        return 'auto';
      }
    } else {
      return 'auto';
    }
  });
  // const [align,setAlign] = useState(props.commonSettings?.align||'left');

  // useEffect(() => {
  //   if (isChange) {
  //     let s = { ...settings };
  //     props.onChange(s);
  //     setIsChange(false);
  //   }
  // }, [isChange]);

  const selectChange = (type: 'width', value: string | number | undefined) => {
    if (value) commonChange(type, value);
  };

  const rangeChange = (
    type: keyof Pick<CommonSettingsType, 'marginTop' | 'padding' | 'width'>,
    value: string | number | undefined,
  ) => {
    if (value) commonChange(type, value);
  };

  const pickChange = (
    type: keyof Pick<CommonSettingsType, 'backgroundColor' | 'color'>,
    value: string | number | undefined,
  ) => {
    if (value) commonChange(type, value);
  };

  const buttonChange = (type: keyof Pick<CommonSettingsType, 'align'>, value: string) => {
    if (value) commonChange(type, value);
  };

  const getWidgetByType = (type: string) => {
    const widget = properties.find((item) => item.type === type);
    return widget;
  };

  const hasProperty = (propName: string, compName: string) => {
    if (!compName) return false;
    // the same as: return compName.indexOf(propName) !== -1;
    // or return the last index of comp
    // return hasConfig(compName, propName);
  };

  const containSetting = (propName: string, compName: string) => {
    let originalWidget = null;
    if (!compName) return false;
    if (!selectedWidget) return false;

    const { category, type } = selectedWidget;
    if (category === 'layout') {
      // originalWidget = getLayoutByType(type);
    } else if (category === 'widget') {
      originalWidget = getWidgetByType(type);
    } else {
      console.error(`Unknown category: ${category}`);
    }
    if (!originalWidget) return false;
    return Object.keys(originalWidget).includes(propName);
  };

  // const Comp = useMemo(() => {
  //   return WidgetProperties[selectedWidget.type];
  // }, [selectedWidgetIndex]);
  return (
    <div>
      <PropertyGroup
        header="Block settings"
        expandable={true}
        open={blockOpen}
        onOpenClose={(open) => setBlockOpen(open)}
      >
        {Object.entries(common_properties).map(([propName, componentName]) => {
          return containSetting(propName, componentName) ? (
            <PropertyItem label={propName} key={propName}>
              <Property
                selected={selectedWidget.type}
                componentName={componentName}
                propName={propName}
                {...selectedWidget.props}
              />
            </PropertyItem>
          ) : null;
        })}

        {/* <PropertyItem label="To top">
          <Ranger
            min={0}
            max={100}
            step={5}
            defaultValue={settings.marginTop ? settings.marginTop : 0}
            onChange={(value) => {
              rangeChange('marginTop', value);
              // setSettings({ ...settings, marginTop: v });
              // setIsChange(true);
            }}
          />
        </PropertyItem>

        {containSetting('padding') && (
          <PropertyItem label="Padding">
            <Ranger
              min={0}
              max={30}
              step={1}
              defaultValue={settings.padding ? settings.padding : 0}
              onChange={(value) => {
                rangeChange('padding', value);
                // setSettings({ ...settings, padding: v });
                // setIsChange(true);
              }}
            />
          </PropertyItem>
        )}

        {containSetting('align') && (
          <PropertyItem label="Align">
            {alignList.map((format: any, index: any) => {
              return (
                <PropertyButton
                  title={format}
                  key={format}
                  onClick={() => {
                    // setSettings({ ...settings, textAlign: format });
                    // setIsChange(true);
                    buttonChange('align', format);
                  }}
                  selected={settings.textAlign == format ? true : false}
                >
                  <BlockButton formats={format} />
                </PropertyButton>
              );
            })}
          </PropertyItem>
        )}

        {containSetting('backgroundColor') && (
          <PropertyItem label="Background color:" autoWidth={true}>
            <PickColor
              color={settings.backgroundColor ? settings.backgroundColor : ''}
              onChange={(value) => {
                pickChange('backgroundColor', value);
                // setSettings({ ...settings, backgroundColor: v });
                // setIsChange(true);
              }}
            ></PickColor>
          </PropertyItem>
        )}

        {containSetting('color') && (
          <PropertyItem label="Text color:" autoWidth={true}>
            <PickColor
              color={settings.color ? settings.color : '#000000'}
              onChange={(value) => {
                pickChange('color', value);
                // setSettings({ ...settings, color: v });
                // setIsChange(true);
              }}
            ></PickColor>
          </PropertyItem>
        )}

        {containSetting('width') && (
          <PropertyItem label="Width">
            <Select
              value={widthType}
              onChange={(e) => {
                const value = e.target.value;
                selectChange('width', value === 'custom' ? '150px' : value);
              }}
              displayEmpty
              size="small"
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="auto">
                <em>auto</em>
              </MenuItem>
              <MenuItem value="100%">100%</MenuItem>
              <MenuItem value="custom">custom</MenuItem>
            </Select>

            {widthType === 'custom' && (
              <Ranger
                min={50}
                max={800}
                step={5}
                defaultValue={settings.width ? parseFloat(settings.width) : 150}
                onChange={(value) => {
                  rangeChange('width', `${value}px`);
                  // setSettings({ ...settings, width: v + 'px' });
                  // setIsChange(true);
                }}
              />
            )}
          </PropertyItem>
        )} */}
      </PropertyGroup>

      {props.onDelete && (
        <div style={{ float: 'right' }}>
          <PropertyButton
            color="warning"
            title="Delete"
            onClick={() => {
              if (props.onDelete) props.onDelete();
            }}
          >
            <DeleteOutline />
          </PropertyButton>
        </div>
      )}
    </div>
  );
};